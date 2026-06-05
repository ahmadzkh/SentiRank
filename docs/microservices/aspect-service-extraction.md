# Aspect Service Extraction

## Purpose

MS-08 extracts aspect-domain API responsibility into `aspect-service`. The service owns aspect classification, aspect summary, and SVM evaluation summary endpoints for the SentiRank microservice architecture.

The selected SVM classifier remains:

```text
merged_5class
```

The original `original_7class` SVM scenario remains an exploratory baseline for evaluation comparison only.

## Service Responsibility

`aspect-service` owns:

- `GET /health`
- `GET /`
- `POST /aspects/classify`
- `GET /aspects/summary`
- `GET /aspects/evaluation`

The API Gateway exposes the same frontend-facing routes and forwards them to `aspect-service`. The gateway does not classify aspects and does not read SVM evaluation files directly.

## Final Aspect Labels

The selected merged taxonomy contains five labels:

- `Features, Content & Audio Experience`
- `App Reliability & Usability`
- `Ads Experience`
- `Subscription & Pricing`
- `Account/Login`

This taxonomy aligns with the final candidate AHP/Fuzzy AHP criteria and reduces instability from sparse original classes such as `UI/UX` and `Audio Quality`.

## Model Artifact Policy

MS-08 does not train SVM, fit TF-IDF, create model artifacts, or copy artifacts into the service folder. Existing artifacts under `ml-service/saved_models/svm/` are local runtime artifacts and must not be committed.

The Docker Compose service can mount the local SVM artifact directory read-only:

```yaml
volumes:
  - ./ml-service/saved_models/svm:/app/models/svm:ro
environment:
  ASPECT_MODEL_DIR: /app/models/svm
```

Even if the artifact is detected, MS-08 keeps classification fallback-only. Real SVM artifact loading should be implemented in a later explicit model-serving phase.

## Fallback Demo Behavior

When real model inference is unavailable, `POST /aspects/classify` returns deterministic fallback demo classification with `mode: "fallback"` and an explicit warning.

Fallback keyword routing:

- ads/iklan -> `Ads Experience`
- premium/harga/bayar/langganan -> `Subscription & Pricing`
- login/akun/password/email -> `Account/Login`
- error/crash/lemot/lambat/bug -> `App Reliability & Usability`
- lagu/playlist/audio/lirik/download/podcast -> `Features, Content & Audio Experience`
- default -> `Features, Content & Audio Experience`

Fallback output is for service integration and frontend demo behavior only; it is not real SVM inference.

## Research Output Strategy

Summary and evaluation endpoints read small generated research outputs when available:

- `datasets/outputs/eda/04_svm/svm_aspect_dataset_summary.json`
- `datasets/outputs/eda/04_svm/final_aspect_taxonomy_for_ahp.json`
- `datasets/outputs/eda/04_svm/svm_final_model_selection.json`
- `datasets/outputs/eda/04_svm/svm_scenario_comparison.json`
- `datasets/outputs/eda/04_svm/svm_merged_5class_metrics.json`
- `datasets/outputs/eda/04_svm/svm_merged_5class_classification_report.json`
- `datasets/outputs/eda/05_evaluation/model_evaluation_summary.json`

Missing files are returned as warnings instead of crashing the service.

## Gateway Routes

Frontend clients should call only:

- `POST http://localhost:8000/aspects/classify`
- `GET http://localhost:8000/aspects/summary`
- `GET http://localhost:8000/aspects/evaluation`

Internal routing:

```text
frontend-service -> api-gateway-service -> aspect-service
```

## Weak-Label Limitation

The SVM aspect classifier is trained and evaluated on weak labels derived from keyword-based aspect labeling. Therefore, evaluation reflects the ability to learn weak-label aspect patterns, not expert-validated ground truth.

## Limitations

- The classification endpoint is fallback-only in MS-08.
- Production model serving can be improved later with explicit artifact loading, vectorizer compatibility checks, and resource controls.
- Legacy `ml-service` remains available during the migration and is not removed by this extraction.
