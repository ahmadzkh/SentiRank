from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

from app.core.config import (
    EXPERT_JUDGEMENT_NOTE,
    FINAL_ASPECT_CLASSIFIER,
    FINAL_SENTIMENT_MODEL,
    Settings,
)
from app.schemas.report import EvaluationSummaryData, ReportSummaryData


class ReportSummaryService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.datasets_dir = settings.datasets_dir
        self.docs_dir = settings.docs_dir
        self.eda_dir = self.datasets_dir / "outputs" / "eda"
        self.evaluation_dir = self.eda_dir / "05_evaluation"
        self.indobert_dir = self.eda_dir / "03_indobert"
        self.svm_dir = self.eda_dir / "04_svm"
        self.ahp_dir = self.eda_dir / "06_ahp"
        self.fuzzy_ahp_dir = self.eda_dir / "07_fuzzy_ahp"
        self.ranking_comparison_dir = self.eda_dir / "08_ranking_comparison"

    def evaluation_summary(self) -> EvaluationSummaryData:
        warnings: list[str] = []
        evaluation_json = self._read_json(
            self.evaluation_dir / "model_evaluation_summary.json",
            warnings,
        )
        evaluation_records = self._read_csv_records(
            self.evaluation_dir / "model_evaluation_summary.csv",
            warnings,
        )
        final_selection = self._read_json(
            self.svm_dir / "svm_final_model_selection.json",
            warnings,
        )
        taxonomy = self._read_json(
            self.svm_dir / "final_aspect_taxonomy_for_ahp.json",
            warnings,
        )

        final_criteria = self._final_criteria(evaluation_json, taxonomy)
        ahp_status = self._ahp_fuzzy_ahp_status()

        limitations = self._limitations(evaluation_json)
        if EXPERT_JUDGEMENT_NOTE not in limitations:
            limitations.append(EXPERT_JUDGEMENT_NOTE)

        return EvaluationSummaryData(
            selected_indobert_model=self._string_value(
                evaluation_json,
                "selected_indobert_model",
                FINAL_SENTIMENT_MODEL,
            ),
            selected_svm_model=self._string_value(
                evaluation_json,
                "selected_svm_model",
                self._string_value(final_selection, "selected_scenario", FINAL_ASPECT_CLASSIFIER),
            ),
            indobert_run_comparison=self._list_value(
                evaluation_json,
                "indobert_run_comparison",
                self._indobert_fallback_comparison(warnings),
            ),
            svm_scenario_comparison=self._list_value(
                evaluation_json,
                "svm_scenario_comparison",
                self._svm_fallback_comparison(final_selection),
            ),
            model_evaluation_records=evaluation_records,
            final_aspect_criteria=final_criteria,
            ahp_fuzzy_ahp_sample_status=ahp_status,
            limitations=limitations,
            expert_judgement_note=EXPERT_JUDGEMENT_NOTE,
            output_source_availability=self._source_availability(),
            warnings=warnings,
        )

    def report_summary(self) -> ReportSummaryData:
        evaluation = self.evaluation_summary()
        warnings = list(evaluation.warnings)
        ahp_status = evaluation.ahp_fuzzy_ahp_sample_status

        demo_notes = [
            "Report service aggregates existing research outputs only.",
            "No model training, scraping, preprocessing, or final AHP/Fuzzy AHP calculation is performed by this service.",
        ]
        if ahp_status.get("status") == "sample_development_only":
            demo_notes.append(EXPERT_JUDGEMENT_NOTE)

        limitations = [
            "File-based research outputs must be mounted or present locally for complete summaries.",
            "AHP/Fuzzy AHP final ranking is not available until validated real expert judgement is provided.",
        ]
        for limitation in evaluation.limitations:
            if limitation not in limitations:
                limitations.append(limitation)

        return ReportSummaryData(
            project_name="SentiRank",
            application="Spotify Google Play Reviews",
            pipeline_status=self._pipeline_status(ahp_status),
            selected_models={
                "sentiment": evaluation.selected_indobert_model,
                "aspect": evaluation.selected_svm_model,
            },
            final_criteria=evaluation.final_aspect_criteria,
            demo_notes=demo_notes,
            limitations=limitations,
            expert_judgement_note=EXPERT_JUDGEMENT_NOTE,
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
    def _string_value(payload: Any, key: str, fallback: str) -> str:
        if isinstance(payload, dict) and payload.get(key):
            return str(payload[key])
        return fallback

    @staticmethod
    def _list_value(payload: Any, key: str, fallback: list[dict]) -> list[dict]:
        if isinstance(payload, dict) and isinstance(payload.get(key), list):
            return [item for item in payload[key] if isinstance(item, dict)]
        return fallback

    @staticmethod
    def _limitations(payload: Any) -> list[str]:
        if isinstance(payload, dict) and isinstance(payload.get("limitations"), list):
            return [str(item) for item in payload["limitations"]]
        return []

    @staticmethod
    def _final_criteria(evaluation_json: Any, taxonomy: Any) -> list[dict]:
        if isinstance(evaluation_json, dict) and isinstance(evaluation_json.get("final_aspect_criteria"), list):
            return [item for item in evaluation_json["final_aspect_criteria"] if isinstance(item, dict)]
        if isinstance(taxonomy, dict) and isinstance(taxonomy.get("criteria"), list):
            return [item for item in taxonomy["criteria"] if isinstance(item, dict)]
        return []

    @staticmethod
    def _svm_fallback_comparison(final_selection: Any) -> list[dict]:
        if not isinstance(final_selection, dict):
            return []
        records = []
        for key in ("original_7class_summary", "merged_5class_summary"):
            if isinstance(final_selection.get(key), dict):
                records.append(final_selection[key])
        return records

    def _indobert_fallback_comparison(self, warnings: list[str]) -> list[dict]:
        if not self.indobert_dir.exists():
            warnings.append(f"Missing directory: {self._display_path(self.indobert_dir)}")
            return []

        records = []
        for run_dir in sorted(self.indobert_dir.iterdir()):
            if not run_dir.is_dir():
                continue
            metrics = self._read_json(run_dir / "indobert_training_metrics.json", warnings)
            if isinstance(metrics, dict):
                record = self._metric_record(run_dir.name, metrics)
                if record:
                    records.append(record)
        return records

    @staticmethod
    def _metric_record(candidate_name: str, payload: dict) -> dict:
        metrics = payload.get("test_metrics") if isinstance(payload.get("test_metrics"), dict) else payload
        keys = (
            "accuracy",
            "precision_macro",
            "recall_macro",
            "f1_macro",
            "precision_weighted",
            "recall_weighted",
            "f1_weighted",
            "neutral_precision",
            "neutral_recall",
            "neutral_f1",
        )
        record = {"candidate_name": candidate_name}
        for key in keys:
            value = metrics.get(key) or metrics.get(f"test_{key}") or metrics.get(f"eval_{key}")
            if value is not None:
                record[key] = value
        return record if len(record) > 1 else {}

    def _ahp_fuzzy_ahp_status(self) -> dict[str, Any]:
        ahp_sample = self.ahp_dir / "sample_development" / "ahp_calculation_summary_sample_development.json"
        fuzzy_sample = (
            self.fuzzy_ahp_dir
            / "sample_development"
            / "fuzzy_ahp_calculation_summary_sample_development.json"
        )
        comparison_sample = (
            self.ranking_comparison_dir
            / "sample_development"
            / "ranking_comparison_summary_sample_development.json"
        )

        final_candidates = [
            self.ahp_dir / "final" / "ahp_calculation_summary.json",
            self.fuzzy_ahp_dir / "final" / "fuzzy_ahp_calculation_summary.json",
            self.ranking_comparison_dir / "final" / "ranking_comparison_summary.json",
        ]
        final_available = all(path.exists() for path in final_candidates)
        sample_available = ahp_sample.exists() or fuzzy_sample.exists() or comparison_sample.exists()

        if final_available:
            status = "final_available"
            is_sample = False
            not_final = False
            note = "Final expert judgement outputs are available."
        elif sample_available:
            status = "sample_development_only"
            is_sample = True
            not_final = True
            note = EXPERT_JUDGEMENT_NOTE
        else:
            status = "pending_expert_judgement"
            is_sample = False
            not_final = True
            note = "AHP/Fuzzy AHP final result is pending validated real expert judgement."

        return {
            "status": status,
            "is_sample": is_sample,
            "not_final_expert_judgement": not_final,
            "ahp_sample_available": ahp_sample.exists(),
            "fuzzy_ahp_sample_available": fuzzy_sample.exists(),
            "ranking_comparison_sample_available": comparison_sample.exists(),
            "final_outputs_available": final_available,
            "note": note,
        }

    def _pipeline_status(self, ahp_status: dict[str, Any]) -> dict[str, str]:
        return {
            "data_acquisition": self._stage_status("01_data_acquisition"),
            "preprocessing": self._stage_status("02_preprocessing"),
            "sentiment_modeling": self._stage_status("03_indobert"),
            "aspect_classification": self._stage_status("04_svm"),
            "model_evaluation": self._stage_status("05_evaluation"),
            "ahp_fuzzy_ahp": str(ahp_status.get("status", "pending_expert_judgement")),
        }

    def _stage_status(self, stage_folder: str) -> str:
        path = self.eda_dir / stage_folder
        if path.exists() and any(path.iterdir()):
            return "available"
        return "missing"

    def _source_availability(self) -> dict[str, bool]:
        return {
            "datasets_dir": self.datasets_dir.exists(),
            "docs_dir": self.docs_dir.exists(),
            "eda_dir": self.eda_dir.exists(),
            "model_evaluation_summary_json": (
                self.evaluation_dir / "model_evaluation_summary.json"
            ).exists(),
            "model_evaluation_summary_csv": (
                self.evaluation_dir / "model_evaluation_summary.csv"
            ).exists(),
            "indobert_outputs": self.indobert_dir.exists(),
            "svm_final_selection": (
                self.svm_dir / "svm_final_model_selection.json"
            ).exists(),
            "final_aspect_taxonomy": (
                self.svm_dir / "final_aspect_taxonomy_for_ahp.json"
            ).exists(),
            "ahp_sample_development": (self.ahp_dir / "sample_development").exists(),
            "fuzzy_ahp_sample_development": (
                self.fuzzy_ahp_dir / "sample_development"
            ).exists(),
            "ranking_comparison_sample_development": (
                self.ranking_comparison_dir / "sample_development"
            ).exists(),
        }

    def _display_path(self, path: Path) -> str:
        try:
            return str(path.relative_to(self.datasets_dir.parent))
        except ValueError:
            return str(path)

