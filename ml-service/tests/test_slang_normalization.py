import pytest

from app.utils.slang_normalization import (
    build_slang_replacement_summary,
    count_slang_replacements,
    normalize_slang_text,
    normalize_slang_texts,
)


def test_normalize_slang_text_preserves_negation_meaning() -> None:
    assert normalize_slang_text("gak bisa") == "tidak bisa"


def test_normalize_slang_text_handles_review_sentence_conservatively() -> None:
    normalized = normalize_slang_text("apk nya lemot bgt gak bisa login")

    assert "aplikasi" in normalized
    assert "lambat" in normalized
    assert "banget" in normalized
    assert "tidak bisa login" in normalized


def test_normalize_slang_text_handles_app_review_terms() -> None:
    normalized = normalize_slang_text("apk ini ngelag")

    assert "aplikasi" in normalized
    assert "lag" in normalized


def test_normalize_slang_text_preserves_empty_target_emotion_signal() -> None:
    assert "tertawa" in normalize_slang_text("premium mahal wkwk")
    assert "kesal" in normalize_slang_text("ugh aplikasi error terus")
    assert "ragu" in normalize_slang_text("hmm bagus sih tapi iklan mulu")


def test_normalize_slang_text_handles_non_string_safely() -> None:
    assert normalize_slang_text(None) == ""
    assert normalize_slang_text(123) == ""


def test_normalize_slang_texts_preserves_order() -> None:
    assert normalize_slang_texts(["apk", "gak bisa"]) == ["aplikasi", "tidak bisa"]


def test_count_slang_replacements() -> None:
    counts = count_slang_replacements("apk gak bisa dibuka")

    assert counts["apk"] == 1
    assert counts["gak"] == 1


def test_identity_mapping_is_not_counted_as_changed() -> None:
    assert normalize_slang_text("audio") == "audio"
    assert count_slang_replacements("audio") == {}


def test_risky_one_character_tokens_are_not_replaced() -> None:
    assert normalize_slang_text("x v k") == "x v k"


def test_build_slang_replacement_summary() -> None:
    summary = build_slang_replacement_summary(["apk bagus", "tidak berubah", "awkarin x"])

    assert summary["total_rows"] == 3
    assert summary["changed_rows"] == 1
    assert summary["changed_percentage"] == pytest.approx(100 / 3)
    assert summary["replacement_counts"]["apk"] == 1
    assert summary["skipped_empty_target_count"] >= 1
    assert summary["skipped_risky_short_token_count"] >= 1
