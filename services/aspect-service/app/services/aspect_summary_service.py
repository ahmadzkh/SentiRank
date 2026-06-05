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

        return AspectSummaryData(
            selected_classifier=self._selected_classifier(final_selection),
            final_aspect_labels=FINAL_ASPECT_LABELS,
            model_status=AspectClassifierService(self.settings).model_status(),
            original_7class_baseline=self._original_baseline(final_selection),
            merged_5class_taxonomy=self._taxonomy_criteria(taxonomy),
            aspect_distribution=self._aspect_distribution(dataset_summary),
            negative_aspect_distribution=self._negative_aspect_distribution(taxonomy, warnings),
            weak_label_limitation=self._weak_label_limitation(final_selection, dataset_summary),
            output_source_availability=self._source_availability(),
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
            selected_candidate=FINAL_ASPECT_CLASSIFIER,
            scenario_comparison=comparison,
            selected_metrics=self._selected_metrics(final_selection, merged_metrics, comparison),
            classification_report=classification_report if isinstance(classification_report, dict) else {},
            limitations=[
                WEAK_LABEL_LIMITATION,
                "Model artifact may not be mounted in the current runtime environment.",
                "Prediction endpoint uses fallback demo classification unless a safe local SVM artifact loader is added later.",
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

    def _read_csv_records(self, path: Path, warnings: list[str]) -> list[dict]:
        if not path.exists():
            warnings.append(f"Missing file: {self._display_path(path)}")
            return []
        try:
            with path.open("r", encoding="utf-8", newline="") as csv_file:
                return [dict(row) for row in csv.DictReader(csv_file)]
        except OSError as error:
            warnings.append(f"Could not read CSV file {self._display_path(path)}: {error}")
            return []

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
        if isinstance(scenario_comparison, list):
            return [item for item in scenario_comparison if isinstance(item, dict)]
        if isinstance(final_selection, dict):
            records = []
            for key in ("original_7class_summary", "merged_5class_summary"):
                if isinstance(final_selection.get(key), dict):
                    records.append(final_selection[key])
            if records:
                return records
        records = [
            AspectSummaryService._metrics_record("original_7class", original_metrics),
            AspectSummaryService._metrics_record("merged_5class", merged_metrics),
        ]
        return [record for record in records if record]

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

    def _source_availability(self) -> dict[str, bool]:
        return {
            "datasets_dir": self.datasets_dir.exists(),
            "docs_dir": self.docs_dir.exists(),
            "svm_output_dir": self.svm_dir.exists(),
            "aspect_dataset_summary": (self.svm_dir / "svm_aspect_dataset_summary.json").exists(),
            "final_taxonomy": (self.svm_dir / "final_aspect_taxonomy_for_ahp.json").exists(),
            "final_model_selection": (self.svm_dir / "svm_final_model_selection.json").exists(),
            "scenario_comparison": (self.svm_dir / "svm_scenario_comparison.json").exists(),
            "selected_metrics": (self.svm_dir / "svm_merged_5class_metrics.json").exists(),
            "selected_classification_report": (
                self.svm_dir / "svm_merged_5class_classification_report.json"
            ).exists(),
            "aspect_by_sentiment_distribution": (
                self.svm_dir / "svm_aspect_by_sentiment_distribution.csv"
            ).exists(),
            "evaluation_summary": self.evaluation_summary_path.exists(),
        }

    def _display_path(self, path: Path) -> str:
        try:
            return str(path.relative_to(self.datasets_dir.parent))
        except ValueError:
            return str(path)
