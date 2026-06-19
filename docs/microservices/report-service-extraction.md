# MS-09 Report Service Extraction

## Purpose

MS-09 extracts report and consolidated evaluation aggregation into `report-service`. The service reads existing SentiRank research outputs from mounted `datasets/` and `docs/` folders and exposes read-only summary endpoints for the API Gateway.

This service does not train models, scrape data, preprocess datasets, run SVM/IndoBERT inference, or calculate final AHP/Fuzzy AHP expert rankings.

MS-13D decision: `report-service` remains active as a Dashboard aggregation service. The service name refers to read-only research-summary aggregation behind the API Gateway, not to the removed frontend Reports page or a printable report feature.

## Service Responsibility

`report-service` owns:

- `GET /reports/summary`
- `GET /evaluation/summary`
- `GET /reports/ranking-comparison`
- project-level pipeline status aggregation
- selected model summary for IndoBERT and SVM
- final candidate AHP/Fuzzy AHP criteria summary
- sample/development AHP/Fuzzy AHP status reporting

It does not own:

- review sampling or dataset details, which belong to `review-service`
- sentiment prediction, which belongs to `sentiment-service`
- aspect classification, which belongs to `aspect-service`
- AHP/Fuzzy AHP calculation, which belongs to `decision-service`

## Output Sources

The service reads existing generated outputs when available:

- `datasets/outputs/eda/05_evaluation/model_evaluation_summary.json`
- `datasets/outputs/eda/05_evaluation/model_evaluation_summary.csv`
- `datasets/outputs/eda/03_indobert/`
- `datasets/outputs/eda/04_svm/svm_final_model_selection.json`
- `datasets/outputs/eda/04_svm/final_aspect_taxonomy_for_ahp.json`
- `datasets/outputs/eda/06_ahp/sample_development/`
- `datasets/outputs/eda/07_fuzzy_ahp/sample_development/`
- `datasets/outputs/eda/08_ranking_comparison/sample_development/`

Missing files are reported in the response `warnings` list. Missing files do not crash the service.

## AHP/Fuzzy AHP Limitation

Current AHP/Fuzzy AHP outputs are sample/development artifacts unless real expert judgement files are validated and calculated in a later phase. `report-service` must not present sample/development outputs as final Spotify improvement priorities.

When only sample outputs exist, `pipeline_status.ahp_fuzzy_ahp` is reported as `sample_development_only`. If no final expert result exists, responses include a note that final AHP/Fuzzy AHP priority ranking requires real expert judgement.

## Gateway Routes

The frontend calls these routes through `api-gateway-service`:

- `GET /reports/summary`
- `GET /evaluation/summary`
- `GET /reports/ranking-comparison`

The gateway forwards those requests to `report-service` and preserves the service response envelope.

Current frontend note: no standalone `/reports` page or Reports menu is active. Dashboard, Model Evaluation, and AHP/Fuzzy AHP still use report-service-backed gateway data, so backend removal would require endpoint ownership migration first.

## Docker Volumes

`report-service` mounts repository research outputs as read-only Docker volumes:

```yaml
volumes:
  - ./datasets:/app/datasets:ro
  - ./docs:/app/docs:ro
environment:
  DATASETS_DIR: /app/datasets
  DOCS_DIR: /app/docs
```

## Future Work

Future phases can replace file-based report aggregation with database-backed report storage after the thesis workflow stabilizes. That change should not alter the frontend-facing API Gateway contract.

