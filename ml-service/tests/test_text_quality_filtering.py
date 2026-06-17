import pytest

from app.utils.text_quality_filtering import (
    HIGH_DIGIT_RATIO,
    HIGH_SYMBOL_RATIO,
    MORSE_LIKE_TEXT,
    REPEATED_GARBAGE_PATTERN,
    TOO_FEW_ALPHABET_CHARS,
    TOO_SHORT_AFTER_CLEANING,
    VALID_DROP_REASON,
    assess_text_quality,
    normalize_unicode_controls,
)


@pytest.mark.parametrize(
    "text",
    [
        "bagus",
        "mantap",
        "jelek",
        "error",
        "login gagal",
        "iklan banyak",
        "lag terus",
        "tidak bisa login",
        "ga",
    ],
)
def test_short_valid_reviews_are_not_dropped(text: str) -> None:
    result = assess_text_quality(text, text)

    assert result["drop_reason"] == VALID_DROP_REASON
    assert result["preprocessing_status"] == "valid"


def test_morse_like_text_is_dropped() -> None:
    result = assess_text_quality(
        "... .- -.-- .- ....... ... .- -. --. .- -",
        "",
    )

    assert result["drop_reason"] == MORSE_LIKE_TEXT


def test_high_symbol_ratio_text_is_dropped() -> None:
    result = assess_text_quality(
        "Bp 000x0zÅºÅºzzza,1,,0;4[(;[4,(^)()&,]()[([[]99]]",
        "bp 000x0z zzza 1 0 4 4 99",
    )

    assert result["drop_reason"] == HIGH_SYMBOL_RATIO


def test_high_digit_ratio_text_is_dropped() -> None:
    result = assess_text_quality("1234567890 0000", "1234567890 0000")

    assert result["drop_reason"] == HIGH_DIGIT_RATIO


def test_too_few_alphabet_chars_is_dropped() -> None:
    result = assess_text_quality("x", "x")

    assert result["drop_reason"] == TOO_FEW_ALPHABET_CHARS


def test_too_short_after_cleaning_is_dropped() -> None:
    result = assess_text_quality("!!!", "")

    assert result["drop_reason"] == TOO_SHORT_AFTER_CLEANING


def test_repeated_garbage_pattern_is_dropped() -> None:
    result = assess_text_quality("zzzzzz", "zz")

    assert result["drop_reason"] == REPEATED_GARBAGE_PATTERN


def test_repeated_digits_are_dropped_as_garbage_pattern() -> None:
    result = assess_text_quality("akun 000000", "akun 000000")

    assert result["drop_reason"] == REPEATED_GARBAGE_PATTERN


def test_natural_expressive_letter_repetition_is_not_dropped() -> None:
    result = assess_text_quality(
        "email nya hadehhhhhhhhhh",
        "email nya hadehhhhhhhhhh",
    )

    assert result["drop_reason"] == VALID_DROP_REASON


def test_emphatic_punctuation_inside_review_is_not_dropped() -> None:
    result = assess_text_quality(
        "dikit2 premium, APALAH!!!!!!!",
        "dikit2 premium apalah",
    )

    assert result["drop_reason"] == VALID_DROP_REASON


def test_short_word_with_emphatic_punctuation_is_not_dropped() -> None:
    result = assess_text_quality("boikot!!!!!!!", "boikot")

    assert result["drop_reason"] == VALID_DROP_REASON


def test_unicode_and_control_characters_are_normalized_conservatively() -> None:
    normalized = normalize_unicode_controls("bagus\u200blogin\0gagal")
    result = assess_text_quality(normalized, normalized)

    assert normalized == "bagus login gagal"
    assert result["drop_reason"] == VALID_DROP_REASON
