"""Conservative text quality filters for preprocessing outputs."""

from __future__ import annotations

import html
import re
import unicodedata
from dataclasses import dataclass

VALID_DROP_REASON = "valid"
MORSE_LIKE_TEXT = "morse_like_text"
HIGH_SYMBOL_RATIO = "high_symbol_ratio"
HIGH_DIGIT_RATIO = "high_digit_ratio"
TOO_FEW_ALPHABET_CHARS = "too_few_alphabet_chars"
TOO_SHORT_AFTER_CLEANING = "too_short_after_cleaning"
REPEATED_GARBAGE_PATTERN = "repeated_garbage_pattern"

PREPROCESSING_STATUS_VALID = "valid"
PREPROCESSING_STATUS_DROPPED = "dropped"

QUALITY_METADATA_COLUMNS = [
    "original_text",
    "cleaned_text",
    "preprocessing_status",
    "drop_reason",
    "text_length_before",
    "text_length_after",
]

QUALITY_DIAGNOSTIC_COLUMNS = [
    "alphabet_char_count",
    "digit_char_count",
    "symbol_char_count",
    "token_count",
    "morse_char_ratio",
    "symbol_char_ratio",
    "digit_char_ratio",
]

ZERO_WIDTH_CHARS = {
    "\u200b",
    "\u200c",
    "\u200d",
    "\u2060",
    "\ufeff",
}
MORSE_CHARS = {".", "-", "/"}
GARBAGE_REPEAT_LETTERS = {"q", "x", "z"}
TOKEN_PATTERN = re.compile(r"[^\W_]+", flags=re.UNICODE)


@dataclass(frozen=True)
class TextQualityConfig:
    min_alphabet_chars: int = 2
    min_token_count: int = 1
    morse_min_chars: int = 6
    morse_ratio_threshold: float = 0.75
    high_symbol_ratio_threshold: float = 0.45
    min_symbol_chars: int = 8
    high_digit_ratio_threshold: float = 0.5
    min_digit_chars: int = 4
    repeated_char_min_run: int = 5


DEFAULT_TEXT_QUALITY_CONFIG = TextQualityConfig()


def normalize_unicode_controls(text: str) -> str:
    """Normalize unicode while replacing control and zero-width chars with spaces."""

    normalized = unicodedata.normalize("NFKC", html.unescape(text))
    chars: list[str] = []

    for char in normalized:
        if char in ZERO_WIDTH_CHARS:
            chars.append(" ")
            continue

        if unicodedata.category(char) in {"Cc", "Cf"}:
            chars.append(" ")
            continue

        chars.append(char)

    return re.sub(r"\s+", " ", "".join(chars)).strip()


def assess_text_quality(
    original_text: str,
    cleaned_text: str,
    config: TextQualityConfig = DEFAULT_TEXT_QUALITY_CONFIG,
) -> dict[str, object]:
    normalized_original = normalize_unicode_controls(original_text)
    normalized_cleaned = normalize_unicode_controls(cleaned_text)
    profile = _build_character_profile(normalized_original, normalized_cleaned)
    drop_reason = _detect_drop_reason(normalized_original, normalized_cleaned, profile, config)
    status = (
        PREPROCESSING_STATUS_VALID
        if drop_reason == VALID_DROP_REASON
        else PREPROCESSING_STATUS_DROPPED
    )

    return {
        "original_text": normalized_original,
        "cleaned_text": normalized_cleaned,
        "preprocessing_status": status,
        "drop_reason": drop_reason,
        "text_length_before": len(normalized_original),
        "text_length_after": len(normalized_cleaned),
        **profile,
    }


def _build_character_profile(
    normalized_original: str,
    normalized_cleaned: str,
) -> dict[str, object]:
    non_space_original = [char for char in normalized_original if not char.isspace()]
    non_space_count = len(non_space_original)
    alphabet_count = sum(1 for char in normalized_cleaned if char.isalpha())
    digit_count = sum(1 for char in non_space_original if char.isdigit())
    symbol_count = sum(
        1
        for char in non_space_original
        if not char.isalpha() and not char.isdigit()
    )
    morse_count = sum(1 for char in non_space_original if char in MORSE_CHARS)
    token_count = len(TOKEN_PATTERN.findall(normalized_cleaned))

    return {
        "alphabet_char_count": alphabet_count,
        "digit_char_count": digit_count,
        "symbol_char_count": symbol_count,
        "token_count": token_count,
        "morse_char_ratio": _safe_ratio(morse_count, non_space_count),
        "symbol_char_ratio": _safe_ratio(symbol_count, non_space_count),
        "digit_char_ratio": _safe_ratio(digit_count, non_space_count),
    }


def _detect_drop_reason(
    normalized_original: str,
    normalized_cleaned: str,
    profile: dict[str, object],
    config: TextQualityConfig,
) -> str:
    if _is_morse_like_text(normalized_original, profile, config):
        return MORSE_LIKE_TEXT

    if _has_repeated_garbage_pattern(normalized_original, profile, config):
        return REPEATED_GARBAGE_PATTERN

    if _has_high_symbol_ratio(profile, config):
        return HIGH_SYMBOL_RATIO

    if _has_high_digit_ratio(profile, config):
        return HIGH_DIGIT_RATIO

    if int(profile["token_count"]) < config.min_token_count or not normalized_cleaned:
        return TOO_SHORT_AFTER_CLEANING

    if int(profile["alphabet_char_count"]) < config.min_alphabet_chars:
        return TOO_FEW_ALPHABET_CHARS

    return VALID_DROP_REASON


def _is_morse_like_text(
    normalized_original: str,
    profile: dict[str, object],
    config: TextQualityConfig,
) -> bool:
    non_space_original = [char for char in normalized_original if not char.isspace()]
    if len(non_space_original) < config.morse_min_chars:
        return False

    has_letters_or_digits = any(char.isalpha() or char.isdigit() for char in non_space_original)
    return (
        not has_letters_or_digits
        and float(profile["morse_char_ratio"]) >= config.morse_ratio_threshold
    )


def _has_high_symbol_ratio(
    profile: dict[str, object],
    config: TextQualityConfig,
) -> bool:
    return (
        int(profile["symbol_char_count"]) >= config.min_symbol_chars
        and float(profile["symbol_char_ratio"]) >= config.high_symbol_ratio_threshold
    )


def _has_high_digit_ratio(
    profile: dict[str, object],
    config: TextQualityConfig,
) -> bool:
    return (
        int(profile["digit_char_count"]) >= config.min_digit_chars
        and float(profile["digit_char_ratio"]) >= config.high_digit_ratio_threshold
    )


def _has_repeated_garbage_pattern(
    normalized_original: str,
    profile: dict[str, object],
    config: TextQualityConfig,
) -> bool:
    alphabet_count = int(profile["alphabet_char_count"])
    digit_ratio = float(profile["digit_char_ratio"])

    digit_run = re.search(
        rf"(\d)\1{{{config.repeated_char_min_run - 1},}}",
        normalized_original,
    )
    if digit_run and (
        digit_ratio >= config.high_digit_ratio_threshold
        or alphabet_count < config.min_alphabet_chars
    ):
        return True

    symbol_run = re.search(
        rf"([^\w\s])\1{{{config.repeated_char_min_run},}}",
        normalized_original,
    )
    if symbol_run and alphabet_count < config.min_alphabet_chars:
        return True

    lower_text = normalized_original.lower()
    for char in GARBAGE_REPEAT_LETTERS:
        if re.search(
            rf"(?<![a-z]){re.escape(char)}{{{config.repeated_char_min_run},}}(?![a-z])",
            lower_text,
        ):
            return True

    return False


def _safe_ratio(numerator: int, denominator: int) -> float:
    if denominator == 0:
        return 0.0

    return round(numerator / denominator, 6)
