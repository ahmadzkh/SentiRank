from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.core.config import FINAL_SENTIMENT_MODEL, SENTIMENT_LABELS, Settings
from app.schemas.sentiment import SentimentEvaluationData, SentimentSummaryData
from app.services.sentiment_inference_service import SentimentInferenceService

RUN_NAMES = [
    "run_1_baseline",
    "run_2_weighted_loss",
    "run_3_weighted_loss_lr_1e-5",
    "run_4_weighted_loss_lr_1e-5_slang_norm",
]


class SentimentSummaryService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.datasets_dir = settings.datasets_dir
        self.eda_dir = self.datasets_dir / "outputs" / "eda"
        self.indobert_dir = self.eda_dir / "03_indobert"
        self.evaluation_summary_path = (
            self.eda_dir / "05_evaluation" / "model_evaluation_summary.json"
        )

    def summary(self) -> SentimentSummaryData:
        warnings: list[str] = []
        runtime_metadata = SentimentInferenceService(self.settings).runtime_metadata()
        evaluation_summary = self._read_json(self.evaluation_summary_path, warnings)
        final_distribution = self._normalise_distribution(
            self._read_json(
                self.eda_dir
                / "02_preprocessing"
                / "label_distribution_after_relabeling.json",
                warnings,
            ),
            label_keys=("sentiment_label", "label", "final_sentiment"),
        )
        raw_distribution = self._normalise_distribution(
            self._read_json(
                self.eda_dir / "01_data_acquisition" / "sentiment_distribution_raw.json",
                warnings,
            ),
            label_keys=("initial_sentiment", "sentiment", "label"),
        )

        if not final_distribution and isinstance(evaluation_summary, dict):
            final_distribution = self._distribution_from_evaluation(evaluation_summary)

        return SentimentSummaryData(
            selected_model=self._selected_model(evaluation_summary),
            sentiment_labels=SENTIMENT_LABELS,
            model_status=str(runtime_metadata["model_status"]),
            model_available=bool(runtime_metadata["model_available"]),
            model_source=str(runtime_metadata["model_source"]),
            configured_model_path=str(runtime_metadata["configured_model_path"]),
            configured_model_id=runtime_metadata["configured_model_id"],
            max_length=int(runtime_metadata["max_length"]),
            prediction_source=str(runtime_metadata["prediction_source"]),
            is_fallback=bool(runtime_metadata["is_fallback"]),
            final_sentiment_distribution=final_distribution,
            raw_sentiment_distribution=raw_distribution,
            output_source_availability=self._source_availability(),
            warnings=warnings + list(runtime_metadata.get("warnings", [])),
        )

    def evaluation(self) -> SentimentEvaluationData:
        warnings: list[str] = []
        evaluation_summary = self._read_json(self.evaluation_summary_path, warnings)
        run_comparison = []

        if isinstance(evaluation_summary, dict) and isinstance(
            evaluation_summary.get("indobert_run_comparison"),
            list,
        ):
            run_comparison = evaluation_summary["indobert_run_comparison"]
        else:
            run_comparison = self._run_comparison_from_run_files(warnings)

        selected_metrics = self._selected_metrics(run_comparison)

        return SentimentEvaluationData(
            selected_candidate=FINAL_SENTIMENT_MODEL,
            run_comparison=run_comparison,
            selected_metrics=selected_metrics,
            limitations=[
                "Model artifact may not be mounted in the current runtime environment.",
                "Prediction endpoint uses real IndoBERT inference when the local artifact or configured Hugging Face model can be loaded.",
                "Prediction endpoint falls back explicitly when the model artifact is unavailable or cannot be loaded.",
                "Run 4 slang normalization was tested but did not outperform Run 3.",
            ],
            output_source_availability=self._source_availability(),
            warnings=warnings,
        )

    def _read_json(self, path: Path, warnings: list[str]) -> Any:
        if not path.exists():
            warnings.append(f"Missing file: {self._display_path(path)}")
            return {}
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            warnings.append(f"Could not read JSON file {self._display_path(path)}: {error}")
            return {}

    def _run_comparison_from_run_files(self, warnings: list[str]) -> list[dict[str, Any]]:
        comparison = []
        for run_name in RUN_NAMES:
            run_dir = self.indobert_dir / run_name
            metrics = self._read_json(run_dir / "indobert_training_metrics.json", warnings)
            report = self._read_json(run_dir / "indobert_classification_report.json", warnings)
            if not metrics and not report:
                continue

            test_metrics = metrics.get("test_metrics", {}) if isinstance(metrics, dict) else {}
            report = report if isinstance(report, dict) else {}
            neutral_report = report.get("Neutral", {}) if isinstance(report.get("Neutral"), dict) else {}
            macro_report = report.get("macro avg", {}) if isinstance(report.get("macro avg"), dict) else {}
            weighted_report = (
                report.get("weighted avg", {})
                if isinstance(report.get("weighted avg"), dict)
                else {}
            )

            comparison.append(
                {
                    "candidate_name": run_name,
                    "status": self._run_status(run_name),
                    "task": "Sentiment classification",
                    "accuracy": self._first_number(
                        test_metrics.get("test_accuracy"),
                        report.get("accuracy"),
                    ),
                    "precision_macro": self._first_number(
                        test_metrics.get("test_precision_macro"),
                        macro_report.get("precision"),
                    ),
                    "recall_macro": self._first_number(
                        test_metrics.get("test_recall_macro"),
                        macro_report.get("recall"),
                    ),
                    "f1_macro": self._first_number(
                        test_metrics.get("test_f1_macro"),
                        macro_report.get("f1-score"),
                    ),
                    "precision_weighted": self._first_number(
                        test_metrics.get("test_precision_weighted"),
                        weighted_report.get("precision"),
                    ),
                    "recall_weighted": self._first_number(
                        test_metrics.get("test_recall_weighted"),
                        weighted_report.get("recall"),
                    ),
                    "f1_weighted": self._first_number(
                        test_metrics.get("test_f1_weighted"),
                        weighted_report.get("f1-score"),
                    ),
                    "test_loss": self._first_number(test_metrics.get("test_loss"), None),
                    "neutral_precision": self._first_number(neutral_report.get("precision"), None),
                    "neutral_recall": self._first_number(neutral_report.get("recall"), None),
                    "neutral_f1": self._first_number(neutral_report.get("f1-score"), None),
                }
            )
        return comparison

    @staticmethod
    def _selected_model(evaluation_summary: Any) -> str:
        if isinstance(evaluation_summary, dict) and evaluation_summary.get("selected_indobert_model"):
            return str(evaluation_summary["selected_indobert_model"])
        return FINAL_SENTIMENT_MODEL

    @staticmethod
    def _selected_metrics(run_comparison: list[dict[str, Any]]) -> dict[str, Any]:
        for item in run_comparison:
            if item.get("candidate_name") == FINAL_SENTIMENT_MODEL or item.get("status") == "selected":
                return item
        return {}

    @staticmethod
    def _run_status(run_name: str) -> str:
        if run_name == "run_1_baseline":
            return "baseline"
        if run_name == FINAL_SENTIMENT_MODEL:
            return "selected"
        return "experiment"

    @staticmethod
    def _first_number(*values: Any) -> float | None:
        for value in values:
            if isinstance(value, int | float):
                return float(value)
        return None

    @staticmethod
    def _normalise_distribution(payload: Any, label_keys: tuple[str, ...]) -> dict[str, int]:
        if isinstance(payload, dict):
            if all(isinstance(value, int) for value in payload.values()):
                return {str(key): int(value) for key, value in payload.items()}
            records = payload.get("data") or payload.get("records")
            if isinstance(records, list):
                return SentimentSummaryService._normalise_distribution(records, label_keys)
        if isinstance(payload, list):
            result: dict[str, int] = {}
            for item in payload:
                if not isinstance(item, dict):
                    continue
                label = None
                for key in label_keys:
                    if item.get(key) is not None:
                        label = str(item[key])
                        break
                count = item.get("count")
                if label is not None and isinstance(count, int):
                    result[label] = count
            return result
        return {}

    @staticmethod
    def _distribution_from_evaluation(payload: dict[str, Any]) -> dict[str, int]:
        comparison = payload.get("indobert_run_comparison")
        if not isinstance(comparison, list):
            return {}
        selected = SentimentSummaryService._selected_metrics(comparison)
        support = selected.get("support") if isinstance(selected, dict) else None
        return support if isinstance(support, dict) else {}

    def _source_availability(self) -> dict[str, bool]:
        return {
            "datasets_dir": self.datasets_dir.exists(),
            "docs_dir": self.settings.docs_dir.exists(),
            "evaluation_summary": self.evaluation_summary_path.exists(),
            "indobert_output_dir": self.indobert_dir.exists(),
            "selected_run_metrics": (
                self.indobert_dir
                / FINAL_SENTIMENT_MODEL
                / "indobert_training_metrics.json"
            ).exists(),
            "selected_run_classification_report": (
                self.indobert_dir
                / FINAL_SENTIMENT_MODEL
                / "indobert_classification_report.json"
            ).exists(),
            "configured_model_path": self.settings.indobert_model_path.exists(),
        }

    def _display_path(self, path: Path) -> str:
        try:
            return str(path.relative_to(self.datasets_dir.parent))
        except ValueError:
            return str(path)
