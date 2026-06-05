import json
from pathlib import Path

from app.core.config import EXPERT_JUDGEMENT_NOTE, Settings
from app.services.report_summary_service import ReportSummaryService


def _settings(tmp_path: Path) -> Settings:
    datasets_dir = tmp_path / "datasets"
    docs_dir = tmp_path / "docs"
    datasets_dir.mkdir(parents=True)
    docs_dir.mkdir(parents=True)
    return Settings(datasets_dir=datasets_dir, docs_dir=docs_dir)


def test_summary_should_handle_missing_files_gracefully(tmp_path: Path) -> None:
    service = ReportSummaryService(_settings(tmp_path))

    evaluation = service.evaluation_summary()
    report = service.report_summary()

    assert evaluation.selected_indobert_model == "run_3_weighted_loss_lr_1e-5"
    assert evaluation.selected_svm_model == "merged_5class"
    assert evaluation.ahp_fuzzy_ahp_sample_status["status"] == "pending_expert_judgement"
    assert evaluation.warnings
    assert report.selected_models["sentiment"] == "run_3_weighted_loss_lr_1e-5"
    assert report.pipeline_status["ahp_fuzzy_ahp"] == "pending_expert_judgement"
    assert EXPERT_JUDGEMENT_NOTE in report.expert_judgement_note


def test_summary_should_read_fixture_outputs_and_detect_sample_status(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    eda_dir = settings.datasets_dir / "outputs" / "eda"
    evaluation_dir = eda_dir / "05_evaluation"
    svm_dir = eda_dir / "04_svm"
    ahp_dir = eda_dir / "06_ahp" / "sample_development"
    fuzzy_dir = eda_dir / "07_fuzzy_ahp" / "sample_development"
    comparison_dir = eda_dir / "08_ranking_comparison" / "sample_development"
    for directory in [evaluation_dir, svm_dir, ahp_dir, fuzzy_dir, comparison_dir]:
        directory.mkdir(parents=True)

    (evaluation_dir / "model_evaluation_summary.json").write_text(
        json.dumps(
            {
                "selected_indobert_model": "run_3_weighted_loss_lr_1e-5",
                "selected_svm_model": "merged_5class",
                "indobert_run_comparison": [
                    {"candidate_name": "run_3_weighted_loss_lr_1e-5", "status": "selected"}
                ],
                "svm_scenario_comparison": [
                    {"candidate_name": "merged_5class", "status": "selected"}
                ],
                "final_aspect_criteria": [
                    {"name": "App Reliability & Usability", "use_in_ahp": True}
                ],
                "limitations": ["Weak labels require careful interpretation."],
            }
        ),
        encoding="utf-8",
    )
    (evaluation_dir / "model_evaluation_summary.csv").write_text(
        "model_component,candidate_name,status\n"
        "IndoBERT,run_3_weighted_loss_lr_1e-5,selected\n",
        encoding="utf-8",
    )
    (svm_dir / "svm_final_model_selection.json").write_text(
        json.dumps({"selected_scenario": "merged_5class"}),
        encoding="utf-8",
    )
    (svm_dir / "final_aspect_taxonomy_for_ahp.json").write_text(
        json.dumps({"criteria": [{"name": "Ads Experience"}]}),
        encoding="utf-8",
    )
    (ahp_dir / "ahp_calculation_summary_sample_development.json").write_text(
        json.dumps({"is_sample": True}),
        encoding="utf-8",
    )
    (fuzzy_dir / "fuzzy_ahp_calculation_summary_sample_development.json").write_text(
        json.dumps({"is_sample": True}),
        encoding="utf-8",
    )
    (comparison_dir / "ranking_comparison_summary_sample_development.json").write_text(
        json.dumps({"is_sample": True}),
        encoding="utf-8",
    )

    service = ReportSummaryService(settings)
    evaluation = service.evaluation_summary()
    report = service.report_summary()

    assert evaluation.selected_indobert_model == "run_3_weighted_loss_lr_1e-5"
    assert evaluation.selected_svm_model == "merged_5class"
    assert evaluation.final_aspect_criteria[0]["name"] == "App Reliability & Usability"
    assert evaluation.model_evaluation_records[0]["candidate_name"] == "run_3_weighted_loss_lr_1e-5"
    assert evaluation.ahp_fuzzy_ahp_sample_status["status"] == "sample_development_only"
    assert evaluation.ahp_fuzzy_ahp_sample_status["not_final_expert_judgement"] is True
    assert report.pipeline_status["model_evaluation"] == "available"
    assert report.pipeline_status["ahp_fuzzy_ahp"] == "sample_development_only"
    assert EXPERT_JUDGEMENT_NOTE in report.demo_notes

