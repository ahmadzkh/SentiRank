import json
from pathlib import Path

from app.core.config import (
    FINAL_ASPECT_LABELS,
    SVM_ASPECT_MODEL_NAME,
    Settings,
)
from app.services.aspect_classifier_service import AspectClassifierService, ModelState
from app.services.aspect_summary_service import AspectSummaryService


class FakeSvmModel:
    classes_ = FINAL_ASPECT_LABELS

    def predict(self, values: list[str]) -> list[str]:
        return ["Ads Experience" for _ in values]

    def predict_proba(self, values: list[str]) -> list[list[float]]:
        return [[0.04, 0.05, 0.82, 0.06, 0.03] for _ in values]


class FakeSvmModelWithoutProba:
    def predict(self, values: list[str]) -> list[str]:
        return ["Account/Login" for _ in values]


def _settings(tmp_path: Path) -> Settings:
    datasets_dir = tmp_path / "datasets"
    docs_dir = tmp_path / "docs"
    model_dir = tmp_path / "models" / "svm"
    model_path = model_dir / "svm_merged_5class_pipeline.joblib"
    datasets_dir.mkdir(parents=True)
    docs_dir.mkdir(parents=True)
    model_dir.mkdir(parents=True)
    return Settings(
        datasets_dir=datasets_dir,
        docs_dir=docs_dir,
        aspect_model_dir=model_dir,
        aspect_model_path=model_path,
    )


def test_fallback_classification_should_be_deterministic(tmp_path: Path) -> None:
    service = AspectClassifierService(_settings(tmp_path))

    samples = {
        "iklan terlalu banyak": "Ads Experience",
        "harga premium terlalu mahal": "Subscription & Pricing",
        "tidak bisa login akun": "Account/Login",
        "aplikasi error dan lemot": "App Reliability & Usability",
        "lagu playlist dan lirik lengkap": "Features, Content & Audio Experience",
        "pengalaman umum spotify": "Features, Content & Audio Experience",
    }

    for text, expected_label in samples.items():
        result = service.classify(text)
        assert result.label == expected_label
        assert result.mode == "fallback"
        assert result.prediction_source == "fallback_keyword"
        assert result.model_name is None
        assert result.is_fallback is True
        assert round(sum(result.scores.values()), 2) == 1.0


def test_model_classification_should_use_loaded_model_when_available(
    tmp_path: Path,
    monkeypatch,
) -> None:
    AspectClassifierService.clear_model_cache()
    settings = _settings(tmp_path)
    settings.aspect_model_path.write_text("placeholder", encoding="utf-8")

    def fake_load_model(model_path: Path) -> ModelState:
        return ModelState(model=FakeSvmModel(), available=True)

    monkeypatch.setattr(AspectClassifierService, "_load_model", staticmethod(fake_load_model))
    service = AspectClassifierService(settings)

    result = service.classify("iklan terlalu banyak")

    assert service.model_status() == "available"
    assert result.label == "Ads Experience"
    assert result.mode == "model"
    assert result.prediction_source == "model"
    assert result.model_name == SVM_ASPECT_MODEL_NAME
    assert result.model_available is True
    assert result.is_fallback is False
    assert result.confidence == 0.82
    assert result.scores["Ads Experience"] == 0.82


def test_model_load_error_should_use_explicit_fallback(
    tmp_path: Path,
    monkeypatch,
) -> None:
    AspectClassifierService.clear_model_cache()
    settings = _settings(tmp_path)

    def fake_load_model(model_path: Path) -> ModelState:
        return ModelState(model=None, available=False, load_error="load_failed")

    monkeypatch.setattr(AspectClassifierService, "_load_model", staticmethod(fake_load_model))
    service = AspectClassifierService(settings)

    result = service.classify("iklan terlalu banyak")

    assert service.model_status() == "unavailable"
    assert result.label == "Ads Experience"
    assert result.mode == "fallback"
    assert result.prediction_source == "fallback_keyword"
    assert result.model_name is None
    assert result.model_available is False
    assert result.is_fallback is True


def test_model_without_predict_proba_should_return_null_confidence(
    tmp_path: Path,
    monkeypatch,
) -> None:
    AspectClassifierService.clear_model_cache()
    settings = _settings(tmp_path)
    settings.aspect_model_path.write_text("placeholder", encoding="utf-8")

    def fake_load_model(model_path: Path) -> ModelState:
        return ModelState(model=FakeSvmModelWithoutProba(), available=True)

    monkeypatch.setattr(AspectClassifierService, "_load_model", staticmethod(fake_load_model))
    service = AspectClassifierService(settings)

    result = service.classify("tidak bisa login akun")

    assert result.mode == "model"
    assert result.prediction_source == "model"
    assert result.confidence is None
    assert result.scores == {}
    assert "predict_proba" in result.warnings[0]


def test_summary_should_read_fixture_json_outputs(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    svm_dir = settings.datasets_dir / "outputs" / "eda" / "04_svm"
    evaluation_dir = settings.datasets_dir / "outputs" / "eda" / "05_evaluation"
    svm_dir.mkdir(parents=True)
    evaluation_dir.mkdir(parents=True)

    (svm_dir / "svm_aspect_dataset_summary.json").write_text(
        json.dumps(
            {
                "aspect_distribution": {
                    "Ads Experience": 4,
                    "Features & Content": 5,
                },
                "methodology_note": "weak labels only",
            }
        ),
        encoding="utf-8",
    )
    (svm_dir / "final_aspect_taxonomy_for_ahp.json").write_text(
        json.dumps(
            {
                "criteria": [
                    {
                        "name": "Ads Experience",
                        "source_labels": ["Ads Experience"],
                    },
                    {
                        "name": "Features, Content & Audio Experience",
                        "source_labels": ["Features & Content", "Audio Quality"],
                    }
                ]
            }
        ),
        encoding="utf-8",
    )
    (svm_dir / "svm_final_model_selection.json").write_text(
        json.dumps(
            {
                "selected_scenario": "merged_5class",
                "original_7class_summary": {
                    "scenario": "original_7class",
                    "f1_macro": 0.89,
                },
                "selected_metrics": {
                    "scenario": "merged_5class",
                    "f1_macro": 0.93,
                    "min_class_f1": 0.88,
                },
                "limitations": "weak label limitation",
            }
        ),
        encoding="utf-8",
    )
    (svm_dir / "svm_scenario_comparison.json").write_text(
        json.dumps(
            [
                {"scenario": "original_7class", "f1_macro": 0.89},
                {"scenario": "merged_5class", "f1_macro": 0.93},
            ]
        ),
        encoding="utf-8",
    )
    (svm_dir / "svm_merged_5class_metrics.json").write_text(
        json.dumps({"test_metrics": {"accuracy": 0.95, "f1_macro": 0.93}}),
        encoding="utf-8",
    )
    (svm_dir / "svm_original_7class_metrics.json").write_text(
        json.dumps({"test_metrics": {"accuracy": 0.94, "f1_macro": 0.89}}),
        encoding="utf-8",
    )
    (svm_dir / "svm_merged_5class_classification_report.json").write_text(
        json.dumps({"Ads Experience": {"f1-score": 0.9}}),
        encoding="utf-8",
    )
    (svm_dir / "svm_original_7class_classification_report.json").write_text(
        json.dumps({"Ads Experience": {"f1-score": 0.8}}),
        encoding="utf-8",
    )
    (evaluation_dir / "model_evaluation_summary.json").write_text(
        json.dumps({"selected_svm_model": "merged_5class"}),
        encoding="utf-8",
    )
    (svm_dir / "svm_aspect_by_sentiment_distribution.csv").write_text(
        "aspect_label,final_sentiment,count\n"
        "Ads Experience,Negative,3\n"
        "Features & Content,Negative,2\n"
        "Audio Quality,Negative,1\n"
        "Ads Experience,Positive,10\n",
        encoding="utf-8",
    )

    service = AspectSummaryService(settings)
    summary = service.summary()
    evaluation = service.evaluation()

    assert summary.selected_classifier == "merged_5class"
    assert summary.model_path_configured is True
    assert summary.prediction_source in {"model", "fallback_keyword"}
    assert summary.aspect_distribution["Ads Experience"] == 4
    assert summary.negative_aspect_distribution["Ads Experience"] == 3
    assert summary.negative_aspect_distribution["Features, Content & Audio Experience"] == 3
    assert summary.merged_5class_taxonomy[0]["name"] == "Ads Experience"
    assert evaluation.selected_candidate == "merged_5class"
    assert evaluation.selected_metrics["f1_macro"] == 0.93
    assert evaluation.classification_report["Ads Experience"]["f1-score"] == 0.9


def test_summary_and_evaluation_should_handle_missing_files(tmp_path: Path) -> None:
    service = AspectSummaryService(_settings(tmp_path))

    summary = service.summary()
    evaluation = service.evaluation()

    assert summary.selected_classifier == "merged_5class"
    assert summary.aspect_distribution == {}
    assert summary.negative_aspect_distribution == {}
    assert summary.warnings
    assert evaluation.scenario_comparison == []
    assert evaluation.warnings
