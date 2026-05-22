"""IndoBERT-safe slang normalization utilities."""

from __future__ import annotations

import re
from collections import Counter
from types import ModuleType
from typing import Final, NamedTuple

from app.resources import slang_dict as slang_dict_module


SLANG_VARIABLE_CANDIDATES: Final[tuple[str, ...]] = (
    "SLANG_DICT",
    "slang_dict",
    "SLANG_MAP",
    "slang_map",
)
EMPTY_TARGET_FALLBACKS: Final[dict[str, str]] = {
    "wkwk": "tertawa",
    "wkwkwk": "tertawa",
    "wkwkwkwk": "tertawa",
    "kwkwk": "tertawa",
    "wkkwk": "tertawa",
    "haha": "tertawa",
    "hehe": "tertawa",
    "hehehe": "tertawa",
    "hihi": "tertawa",
    "xd": "tertawa",
    "xdd": "tertawa",
    "hm": "ragu",
    "hmm": "ragu",
    "emm": "ragu",
    "um": "ragu",
    "ugh": "kesal",
}
DENYLIST_SOURCES: Final[set[str]] = {"awkarin", "di-", "nge"}
ALLOWED_ONE_CHAR_MAPPING: Final[dict[str, str]] = {
    "g": "tidak",
    "w": "saya",
    "u": "kamu",
}
PRESERVED_DOMAIN_TERMS: Final[set[str]] = {"login"}
TARGET_OVERRIDES: Final[dict[str, str]] = {
    "lemot bgt": "lambat banget",
    "lambat bgt": "lambat banget",
    "ga bisa login": "tidak bisa login",
    "gak bisa login": "tidak bisa login",
    "ngga bisa login": "tidak bisa login",
    "nggak bisa login": "tidak bisa login",
}


class SlangProfile(NamedTuple):
    active_mapping: dict[str, str]
    skipped_empty_target_sources: set[str]
    skipped_risky_short_sources: set[str]


def _load_slang_mapping(module: ModuleType) -> dict[str, str]:
    for variable_name in SLANG_VARIABLE_CANDIDATES:
        raw_mapping = getattr(module, variable_name, None)
        if isinstance(raw_mapping, dict):
            return {
                str(source).strip(): "" if target is None else str(target).strip()
                for source, target in raw_mapping.items()
                if str(source).strip()
            }

    candidates = ", ".join(SLANG_VARIABLE_CANDIDATES)
    raise ValueError(f"slang_dict.py must expose one of: {candidates}")


def _build_indobert_safe_profile(mapping: dict[str, str]) -> SlangProfile:
    active_mapping: dict[str, str] = dict(ALLOWED_ONE_CHAR_MAPPING)
    skipped_empty_target_sources: set[str] = set()
    skipped_risky_short_sources: set[str] = set()

    for raw_source, raw_target in mapping.items():
        source = raw_source.strip()
        source_key = source.lower()
        target = raw_target.strip()

        if source_key in DENYLIST_SOURCES or source_key in PRESERVED_DOMAIN_TERMS:
            if not target:
                skipped_empty_target_sources.add(source)
            continue

        if len(source_key) == 1:
            if source_key not in ALLOWED_ONE_CHAR_MAPPING:
                skipped_risky_short_sources.add(source)
                continue
            active_mapping[source_key] = ALLOWED_ONE_CHAR_MAPPING[source_key]
            continue

        if source_key in TARGET_OVERRIDES:
            target = TARGET_OVERRIDES[source_key]

        if not target:
            target = EMPTY_TARGET_FALLBACKS.get(source_key, "")
            if not target:
                skipped_empty_target_sources.add(source)
                continue

        if source_key in EMPTY_TARGET_FALLBACKS:
            target = EMPTY_TARGET_FALLBACKS[source_key]

        if source_key == target.lower():
            continue

        active_mapping[source] = target

    for source_key, target in TARGET_OVERRIDES.items():
        active_mapping[source_key] = target

    return SlangProfile(
        active_mapping=active_mapping,
        skipped_empty_target_sources=skipped_empty_target_sources,
        skipped_risky_short_sources=skipped_risky_short_sources,
    )


def _normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _compile_boundary_pattern(source: str) -> re.Pattern[str]:
    return re.compile(r"(?<!\w)" + re.escape(source) + r"(?!\w)", flags=re.IGNORECASE)


SLANG_MAPPING: Final[dict[str, str]] = _load_slang_mapping(slang_dict_module)
SLANG_PROFILE: Final[SlangProfile] = _build_indobert_safe_profile(SLANG_MAPPING)
PHRASE_MAPPING: Final[dict[str, str]] = {
    source: target
    for source, target in SLANG_PROFILE.active_mapping.items()
    if re.search(r"\s", source) or not re.fullmatch(r"\w+", source, flags=re.UNICODE)
}
TOKEN_MAPPING: Final[dict[str, str]] = {
    source.lower(): target
    for source, target in SLANG_PROFILE.active_mapping.items()
    if source not in PHRASE_MAPPING
}
PHRASE_PATTERNS: Final[tuple[tuple[str, str, re.Pattern[str]], ...]] = tuple(
    (source, target, _compile_boundary_pattern(source))
    for source, target in sorted(
        PHRASE_MAPPING.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    )
)
TOKEN_PATTERN: Final[re.Pattern[str] | None] = (
    re.compile(
        r"\b("
        + "|".join(
            re.escape(source)
            for source in sorted(TOKEN_MAPPING, key=len, reverse=True)
        )
        + r")\b",
        flags=re.IGNORECASE,
    )
    if TOKEN_MAPPING
    else None
)
SKIPPED_EMPTY_TARGET_PATTERNS: Final[tuple[re.Pattern[str], ...]] = tuple(
    _compile_boundary_pattern(source)
    for source in sorted(
        SLANG_PROFILE.skipped_empty_target_sources,
        key=len,
        reverse=True,
    )
)
SKIPPED_RISKY_SHORT_PATTERN: Final[re.Pattern[str] | None] = (
    re.compile(
        r"\b("
        + "|".join(
            re.escape(source)
            for source in sorted(
                SLANG_PROFILE.skipped_risky_short_sources,
                key=len,
                reverse=True,
            )
        )
        + r")\b",
        flags=re.IGNORECASE,
    )
    if SLANG_PROFILE.skipped_risky_short_sources
    else None
)


def _count_skipped_empty_targets(text: str) -> int:
    return sum(len(pattern.findall(text)) for pattern in SKIPPED_EMPTY_TARGET_PATTERNS)


def _count_skipped_risky_short_tokens(text: str) -> int:
    if SKIPPED_RISKY_SHORT_PATTERN is None:
        return 0

    return len(SKIPPED_RISKY_SHORT_PATTERN.findall(text))


def _normalize_with_counts(text: object) -> tuple[str, Counter[str], int, int]:
    if not isinstance(text, str):
        return "", Counter(), 0, 0

    normalized = _normalize_whitespace(text)
    replacement_counts: Counter[str] = Counter()
    skipped_empty_target_count = _count_skipped_empty_targets(normalized)
    skipped_risky_short_token_count = _count_skipped_risky_short_tokens(normalized)

    for source, target, pattern in PHRASE_PATTERNS:
        def replace_phrase(_: re.Match[str]) -> str:
            replacement_counts[source] += 1
            return target

        normalized = pattern.sub(replace_phrase, normalized)

    if TOKEN_PATTERN is not None:
        def replace_token(match: re.Match[str]) -> str:
            source = match.group(0).lower()
            replacement_counts[source] += 1
            return TOKEN_MAPPING[source]

        normalized = TOKEN_PATTERN.sub(replace_token, normalized)

    return (
        _normalize_whitespace(normalized),
        replacement_counts,
        skipped_empty_target_count,
        skipped_risky_short_token_count,
    )


def normalize_slang_text(text: str) -> str:
    """Normalize one text value using the IndoBERT-safe slang profile."""

    normalized, _, _, _ = _normalize_with_counts(text)
    return normalized


def normalize_slang_texts(texts: list[str]) -> list[str]:
    """Normalize a list of text values while preserving item order."""

    return [normalize_slang_text(text) for text in texts]


def count_slang_replacements(text: str) -> dict[str, int]:
    """Count actual slang replacements for one text value."""

    _, replacement_counts, _, _ = _normalize_with_counts(text)
    return dict(replacement_counts)


def build_slang_replacement_summary(texts: list[str]) -> dict:
    """Build aggregate replacement and safety-skip metrics for text values."""

    replacement_counts: Counter[str] = Counter()
    changed_rows = 0
    skipped_empty_target_count = 0
    skipped_risky_short_token_count = 0

    for text in texts:
        (
            normalized,
            text_counts,
            text_skipped_empty_target_count,
            text_skipped_risky_short_token_count,
        ) = _normalize_with_counts(text)
        original = _normalize_whitespace(text) if isinstance(text, str) else ""

        if normalized != original:
            changed_rows += 1

        replacement_counts.update(text_counts)
        skipped_empty_target_count += text_skipped_empty_target_count
        skipped_risky_short_token_count += text_skipped_risky_short_token_count

    total_rows = len(texts)
    changed_percentage = (changed_rows / total_rows * 100) if total_rows else 0.0

    return {
        "total_rows": total_rows,
        "changed_rows": changed_rows,
        "unchanged_rows": total_rows - changed_rows,
        "changed_percentage": changed_percentage,
        "replacement_counts": dict(replacement_counts),
        "top_replacement_counts": dict(replacement_counts.most_common(30)),
        "skipped_empty_target_count": skipped_empty_target_count,
        "skipped_risky_short_token_count": skipped_risky_short_token_count,
    }
