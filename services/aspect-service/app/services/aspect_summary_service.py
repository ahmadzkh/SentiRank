from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

from app.core.config import FINAL_ASPECT_CLASSIFIER, FINAL_ASPECT_LABELS, Settings
from app.schemas.aspect import AspectEvaluationData, AspectSummaryData
from app.services.aspect_classifier_service import AspectClassifierService

WEAK_LABEL_LIMITATION = (
    "The SVM aspect classifier is trained and evaluated on weak labels derived from "
    "keyword-based aspect labeling. Therefore, the evaluation reflects the ability "
    "of the model to learn the weak-label aspect patterns, not expert-validated ground truth."
)


class AspectSummaryService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.datasets_dir = settings.datasets_dir
        self.docs_dir = settings.docs_dir
        self.eda_dir = self.datasets_dir / "outputs" / "eda"
        self.svm_dir = self.eda_dir / "04_svm"
        self.evaluation_summary_path = (
            self.eda_dir / "05_evaluation" / "model_evaluation_summary.json"
        )

    def summary(self) -> AspectSummaryData:
        warnings: list[str] = []
        dataset_summary = self._read_json(
            self.svm_dir / "svm_aspect_dataset_summary.json",
            warnings,
        )
        taxonomy = self._read_json(
            self.svm_dir / "final_aspect_taxonomy_for_ahp.json",
            warnings,
        )
        final_selection = self._read_json(
            self.svm_dir / "svm_final_model_selection.json",
            warnings,
        )
        self._read_json(self.evaluation_summary_path, warnings)
        runtime_metadata = AspectClassifierService(self.settings).runtime_metadata()

        return AspectSummaryData(
            data_status="canonical_retrained",
            selected_classifier=self._selected_classifier(final_selection),
            final_aspect_labels=FINAL_ASPECT_LABELS,
            model_status=str(runtime_metadata["model_status"]),
            model_available=bool(runtime_metadata["model_available"]),
            model_name=(
                str(runtime_metadata["model_name"])
                if runtime_metadata["model_name"] is not None
                else None
            ),
            prediction_source=str(runtime_metadata["prediction_source"]),
            original_7class_baseline=self._original_baseline(final_selection),
            merged_5class_taxonomy=self._taxonomy_criteria(taxonomy),
            aspect_distribution=self._aspect_distribution(dataset_summary),
            negative_aspect_distribution=self._negative_aspect_distribution(taxonomy, warnings),
            weak_label_limitation=self._weak_label_limitation(final_selection, dataset_summary),
            warnings=warnings,
        )

    def evaluation(self) -> AspectEvaluationData:
        warnings: list[str] = []
        final_selection = self._read_json(
            self.svm_dir / "svm_final_model_selection.json",
            warnings,
        )
        scenario_comparison = self._read_json(
            self.svm_dir / "svm_scenario_comparison.json",
            warnings,
        )
        original_metrics = self._read_json(
            self.svm_dir / "svm_original_7class_metrics.json",
            warnings,
        )
        merged_metrics = self._read_json(
            self.svm_dir / "svm_merged_5class_metrics.json",
            warnings,
        )
        classification_report = self._read_json(
            self.svm_dir / "svm_merged_5class_classification_report.json",
            warnings,
        )
        prediction_samples = self._read_prediction_samples(
            self.svm_dir / "svm_merged_5class_predictions.csv",
            warnings,
        )
        self._read_json(
            self.svm_dir / "svm_original_7class_classification_report.json",
            warnings,
        )
        self._read_json(self.evaluation_summary_path, warnings)

        comparison = self._scenario_comparison(
            scenario_comparison,
            final_selection,
            original_metrics,
            merged_metrics,
        )

        return AspectEvaluationData(
            data_status="canonical_retrained",
            selected_candidate=FINAL_ASPECT_CLASSIFIER,
            scenario_comparison=comparison,
            selected_metrics=self._selected_metrics(final_selection, merged_metrics, comparison),
            classification_report=classification_report if isinstance(classification_report, dict) else {},
            prediction_samples=prediction_samples,
            limitations=[
                WEAK_LABEL_LIMITATION,
                "SVM has been retrained on the canonical aspect dataset (96,534 rows, MS-16C/D). Metrics reflect the latest canonical retrained artifact.",
                "If the SVM artifact is not mounted or cannot be loaded, the prediction endpoint returns explicit fallback_keyword metadata.",
            ],
            warnings=warnings,
        )

    def _read_json(self, path: Path, warnings: list[str]) -> Any:
        if not path.exists():
            self._append_warning(warnings, "Some aspect research data is unavailable.")
            return {}
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            self._append_warning(warnings, "Some aspect research data could not be read.")
            return {}

    def _read_csv_records(self, path: Path, warnings: list[str]) -> list[dict]:
        if not path.exists():
            self._append_warning(warnings, "Some aspect research data is unavailable.")
            return []
        try:
            with path.open("r", encoding="utf-8", newline="") as csv_file:
                return [dict(row) for row in csv.DictReader(csv_file)]
        except OSError:
            self._append_warning(warnings, "Some aspect research data could not be read.")
            return []

    def _read_prediction_samples(
        self,
        path: Path,
        warnings: list[str],
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        if not path.exists():
            self._append_warning(warnings, "Some aspect research data is unavailable.")
            return []
        try:
            with path.open("r", encoding="utf-8", newline="") as csv_file:
                reader = csv.DictReader(csv_file)
                return [
                    self._normalise_prediction_sample(row)
                    for _, row in zip(range(limit), reader, strict=False)
                ]
        except OSError:
            self._append_warning(warnings, "Some aspect research data could not be read.")
            return []

    @classmethod
    def _normalise_prediction_sample(cls, row: dict[str, str]) -> dict[str, Any]:
        return {
            "external_id": row.get("external_id") or None,
            "rating": cls._optional_int(row.get("rating")),
            "content": row.get("content") or None,
            "text_svm": row.get("text_svm") or row.get("content") or None,
            "aspect_label": row.get("aspect_label") or None,
            "aspect_label_confidence": row.get("aspect_label_confidence") or None,
            "final_sentiment": row.get("final_sentiment") or None,
            "scenario": row.get("scenario") or None,
            "true_label": row.get("true_label") or None,
            "predicted_label": row.get("predicted_label") or None,
            "is_correct": cls._optional_bool(row.get("is_correct")),
        }

    @staticmethod
    def _optional_int(value: str | None) -> int | None:
        try:
            return int(value) if value not in (None, "") else None
        except ValueError:
            return None

    @staticmethod
    def _optional_bool(value: str | None) -> bool | None:
        if value is None or value == "":
            return None
        normalized = value.strip().lower()
        if normalized in {"true", "1", "yes", "y"}:
            return True
        if normalized in {"false", "0", "no", "n"}:
            return False
        return None

    @staticmethod
    def _selected_classifier(payload: Any) -> str:
        if isinstance(payload, dict) and payload.get("selected_scenario"):
            return str(payload["selected_scenario"])
        return FINAL_ASPECT_CLASSIFIER

    @staticmethod
    def _original_baseline(payload: Any) -> dict:
        if isinstance(payload, dict) and isinstance(payload.get("original_7class_summary"), dict):
            return payload["original_7class_summary"]
        return {}

    @staticmethod
    def _taxonomy_criteria(payload: Any) -> list[dict]:
        if isinstance(payload, dict) and isinstance(payload.get("criteria"), list):
            return [item for item in payload["criteria"] if isinstance(item, dict)]
        return []

    @staticmethod
    def _aspect_distribution(payload: Any) -> dict[str, int]:
        if isinstance(payload, dict) and isinstance(payload.get("aspect_distribution"), dict):
            return {
                str(label): int(count)
                for label, count in payload["aspect_distribution"].items()
                if isinstance(count, int)
            }
        return {}

    def _negative_aspect_distribution(self, taxonomy: Any, warnings: list[str]) -> dict[str, int]:
        rows = self._read_csv_records(
            self.svm_dir / "svm_aspect_by_sentiment_distribution.csv",
            warnings,
        )
        if not rows:
            return {}

        label_to_criterion = self._taxonomy_label_map(taxonomy)
        distribution: dict[str, int] = {}
        for row in rows:
            if str(row.get("final_sentiment", "")).strip().lower() != "negative":
                continue
            source_label = str(row.get("aspect_label", "")).strip()
            criterion = label_to_criterion.get(source_label, source_label)
            if not criterion:
                continue
            try:
                count = int(float(str(row.get("count", 0)).replace(",", ".")))
            except ValueError:
                count = 0
            distribution[criterion] = distribution.get(criterion, 0) + count

        return dict(sorted(distribution.items(), key=lambda item: item[1], reverse=True))

    @staticmethod
    def _taxonomy_label_map(taxonomy: Any) -> dict[str, str]:
        if not isinstance(taxonomy, dict) or not isinstance(taxonomy.get("criteria"), list):
            return {}
        mapping: dict[str, str] = {}
        for criterion in taxonomy["criteria"]:
            if not isinstance(criterion, dict):
                continue
            criterion_name = str(criterion.get("name", "")).strip()
            if not criterion_name:
                continue
            mapping[criterion_name] = criterion_name
            source_labels = criterion.get("source_labels")
            if isinstance(source_labels, list):
                for source_label in source_labels:
                    if source_label:
                        mapping[str(source_label).strip()] = criterion_name
        return mapping

    @staticmethod
    def _weak_label_limitation(final_selection: Any, dataset_summary: Any) -> str:
        if isinstance(final_selection, dict) and final_selection.get("limitations"):
            return str(final_selection["limitations"])
        if isinstance(dataset_summary, dict) and dataset_summary.get("methodology_note"):
            return str(dataset_summary["methodology_note"])
        return WEAK_LABEL_LIMITATION

    @staticmethod
    def _scenario_comparison(
        scenario_comparison: Any,
        final_selection: Any,
        original_metrics: Any,
        merged_metrics: Any,
    ) -> list[dict]:
        records: list[dict] = []
        if isinstance(scenario_comparison, list):
            records = [item for item in scenario_comparison if isinstance(item, dict)]
        elif isinstance(final_selection, dict):
            for key in ("original_7class_summary", "merged_5class_summary"):
                if isinstance(final_selection.get(key), dict):
                    records.append(final_selection[key])

        fallback_records = [
            AspectSummaryService._metrics_record("original_7class", original_metrics),
            AspectSummaryService._metrics_record("merged_5class", merged_metrics),
        ]
        known_scenarios = {
            str(record.get("scenario"))
            for record in records
            if record.get("scenario")
        }
        for record in fallback_records:
            scenario = record.get("scenario")
            if record and scenario not in known_scenarios:
                records.append(record)
                if scenario:
                    known_scenarios.add(str(scenario))
        return records
    @staticmethod
    def _selected_metrics(
        final_selection: Any,
        merged_metrics: Any,
        comparison: list[dict],
    ) -> dict:
        if isinstance(final_selection, dict) and isinstance(final_selection.get("selected_metrics"), dict):
            return final_selection["selected_metrics"]
        if isinstance(merged_metrics, dict):
            record = AspectSummaryService._metrics_record("merged_5class", merged_metrics)
            if record:
                return record
        for item in comparison:
            if item.get("scenario") == FINAL_ASPECT_CLASSIFIER:
                return item
        return {}

    @staticmethod
    def _metrics_record(scenario: str, payload: Any) -> dict:
        if not isinstance(payload, dict):
            return {}
        test_metrics = payload.get("test_metrics") if isinstance(payload.get("test_metrics"), dict) else payload
        metric_keys = (
            "accuracy",
            "precision_macro",
            "recall_macro",
            "f1_macro",
            "precision_weighted",
            "recall_weighted",
            "f1_weighted",
        )
        if not any(test_metrics.get(key) is not None for key in metric_keys):
            return {}
        record = {
            "scenario": scenario,
            "accuracy": test_metrics.get("accuracy"),
            "precision_macro": test_metrics.get("precision_macro"),
            "recall_macro": test_metrics.get("recall_macro"),
            "f1_macro": test_metrics.get("f1_macro"),
            "precision_weighted": test_metrics.get("precision_weighted"),
            "recall_weighted": test_metrics.get("recall_weighted"),
            "f1_weighted": test_metrics.get("f1_weighted"),
        }
        return {key: value for key, value in record.items() if value is not None}

    @staticmethod
    def _append_warning(warnings: list[str], message: str) -> None:
        if message not in warnings:
            warnings.append(message)
