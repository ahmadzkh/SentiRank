import json
from pathlib import Path

from app.core.config import Settings
from app.services.sentiment_inference_service import (
    ModelPrediction,
    ModelState,
    SentimentInferenceService,
)
from app.services.sentiment_summary_service import SentimentSummaryService


def _settings(tmp_path: Path) -> Settings:
    datasets_dir = tmp_path / "datasets"
    docs_dir = tmp_path / "docs"
    model_dir = tmp_path / "models" / "indobert"
    datasets_dir.mkdir(parents=True)
    docs_dir.mkdir(parents=True)
    model_dir.mkdir(parents=True)
    return Settings(
        datasets_dir=datasets_dir,
        docs_dir=docs_dir,
        sentiment_model_dir=model_dir,
        sentiment_model_source="local",
        indobert_model_path=model_dir / "run_3_weighted_loss_lr_1e-5",
        indobert_model_id="ahmadzkh/sentirank-indobert-run3",
        indobert_model_name="run_3_weighted_loss_lr_1e-5",
        indobert_max_length=128,
        hf_token="secret-test-token",
    )


def test_fallback_prediction_should_be_deterministic(tmp_path: Path) -> None:
    service = SentimentInferenceService(_settings(tmp_path))

    negative = service.predict("aplikasi error dan lambat tapi tampilannya bagus")
    positive = service.predict("aplikasi bagus lancar dan nyaman")
    neutral = service.predict("saya membuka aplikasi hari ini")

    assert negative.label == "Negative"
    assert positive.label == "Positive"
    assert neutral.label == "Neutral"
    assert sum(negative.probabilities.values()) == 1.0
    assert negative.mode == "fallback"
    assert negative.prediction_source == "fallback_rule"
    assert negative.model_available is False
    assert negative.is_fallback is True
    assert "secret-test-token" not in negative.model_dump_json()


def test_model_prediction_should_use_model_metadata(monkeypatch, tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    service = SentimentInferenceService(settings)

    def fake_model_state(self):
        return ModelState(
            available=True,
            model_source="local",
            prediction_source="model",
            model_name="run_3_weighted_loss_lr_1e-5",
            configured_model_path=str(settings.indobert_model_path),
            configured_model_id=settings.indobert_model_id,
            max_length=128,
            predict=lambda text: ModelPrediction(
                label="Negative",
                confidence=0.81,
                probabilities={
                    "Negative": 0.81,
                    "Neutral": 0.10,
                    "Positive": 0.09,
                },
            ),
        )

    monkeypatch.setattr(SentimentInferenceService, "_model_state", fake_model_state)

    prediction = service.predict("iklan terlalu banyak dan mengganggu")

    assert prediction.label == "Negative"
    assert prediction.mode == "model"
    assert prediction.prediction_source == "model"
    assert prediction.model_available is True
    assert prediction.is_fallback is False
    assert prediction.warnings == []
    assert set(prediction.probabilities) == {"Negative", "Neutral", "Positive"}
    assert "LABEL_0" not in prediction.model_dump_json()


def test_label_mapping_should_normalize_json_string_ids() -> None:
    mapping = SentimentInferenceService._normalize_id_to_label(
        {"0": "Negative", "1": "Neutral", "2": "Positive"}
    )

    assert mapping == {0: "Negative", 1: "Neutral", 2: "Positive"}


def test_summary_should_read_fixture_json_outputs(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    eda_dir = settings.datasets_dir / "outputs" / "eda"
    (eda_dir / "05_evaluation").mkdir(parents=True)
    (eda_dir / "03_indobert").mkdir(parents=True)
    (eda_dir / "01_data_acquisition").mkdir(parents=True)

    (eda_dir / "05_evaluation" / "model_evaluation_summary.json").write_text(
        json.dumps(
            {
                "selected_indobert_model": "run_3_weighted_loss_lr_1e-5",
                "indobert_run_comparison": [
                    {
                        "candidate_name": "run_3_weighted_loss_lr_1e-5",
                        "status": "selected",
                        "accuracy": 0.7362,
                        "f1_macro": 0.7093,
                        "neutral_recall": 0.6669,
                        "metrics_path": "datasets/outputs/eda/private_metrics.json",
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    (eda_dir / "03_indobert" / "indobert_label_distribution.json").write_text(
        json.dumps(
            [
                {"sentiment_label": "Negative", "count": 20},
                {"sentiment_label": "Neutral", "count": 10},
                {"sentiment_label": "Positive", "count": 30},
            ]
        ),
        encoding="utf-8",
    )
    (eda_dir / "01_data_acquisition" / "sentiment_distribution_raw.json").write_text(
        json.dumps(
            [
                {"initial_sentiment": "Negative", "count": 25},
                {"initial_sentiment": "Neutral", "count": 5},
                {"initial_sentiment": "Positive", "count": 30},
            ]
        ),
        encoding="utf-8",
    )

    service = SentimentSummaryService(settings)
    summary = service.summary()
    evaluation = service.evaluation()

    assert summary.selected_model == "run_3_weighted_loss_lr_1e-5"
    assert summary.model_available is False
    assert summary.prediction_source == "fallback_rule"
    assert summary.is_fallback is True
    assert summary.data_status == "canonical_processed"
    assert summary.final_sentiment_distribution == {
        "Negative": 20,
        "Neutral": 10,
        "Positive": 30,
    }
    assert evaluation.selected_candidate == "run_3_weighted_loss_lr_1e-5"
    assert evaluation.data_status == "historical_pre_canonical_retraining_required"
    assert evaluation.selected_metrics["neutral_recall"] == 0.6669
    assert "metrics_path" not in evaluation.run_comparison[0]
    summary_payload = summary.model_dump()
    evaluation_payload = evaluation.model_dump()
    assert "configured_model_path" not in summary_payload
    assert "output_source_availability" not in summary_payload
    assert "output_source_availability" not in evaluation_payload


def test_summary_and_evaluation_should_handle_missing_files(tmp_path: Path) -> None:
    service = SentimentSummaryService(_settings(tmp_path))

    summary = service.summary()
    evaluation = service.evaluation()

    assert summary.selected_model == "run_3_weighted_loss_lr_1e-5"
    assert summary.final_sentiment_distribution == {}
    assert summary.warnings
    assert all(".json" not in warning and "datasets" not in warning for warning in summary.warnings)
    assert evaluation.run_comparison == []
    assert evaluation.warnings
    assert all(".json" not in warning and "datasets" not in warning for warning in evaluation.warnings)
