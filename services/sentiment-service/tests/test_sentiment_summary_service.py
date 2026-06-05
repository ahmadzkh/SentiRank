import json
from pathlib import Path

from app.core.config import Settings
from app.services.sentiment_inference_service import SentimentInferenceService
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


def test_summary_should_read_fixture_json_outputs(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    eda_dir = settings.datasets_dir / "outputs" / "eda"
    (eda_dir / "05_evaluation").mkdir(parents=True)
    (eda_dir / "02_preprocessing").mkdir(parents=True)
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
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    (eda_dir / "02_preprocessing" / "label_distribution_after_relabeling.json").write_text(
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
    assert summary.final_sentiment_distribution == {
        "Negative": 20,
        "Neutral": 10,
        "Positive": 30,
    }
    assert evaluation.selected_candidate == "run_3_weighted_loss_lr_1e-5"
    assert evaluation.selected_metrics["neutral_recall"] == 0.6669


def test_summary_and_evaluation_should_handle_missing_files(tmp_path: Path) -> None:
    service = SentimentSummaryService(_settings(tmp_path))

    summary = service.summary()
    evaluation = service.evaluation()

    assert summary.selected_model == "run_3_weighted_loss_lr_1e-5"
    assert summary.final_sentiment_distribution == {}
    assert summary.warnings
    assert evaluation.run_comparison == []
    assert evaluation.warnings
