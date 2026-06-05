# Sentiment Service Extraction

## Purpose

MS-07 extracts sentiment-domain API responsibility from the legacy modular backend into `sentiment-service`. The service owns sentiment prediction, sentiment summary, and IndoBERT evaluation summary endpoints for the microservice architecture.

The selected sentiment model remains:

```text
run_3_weighted_loss_lr_1e-5
```

## Service Responsibility

`sentiment-service` owns:

- `GET /health`
- `GET /`
- `POST /sentiment/predict`
- `GET /sentiment/summary`
- `GET /sentiment/evaluation`

The API Gateway exposes the same frontend-facing sentiment routes and forwards them to `sentiment-service`. The gateway does not perform sentiment inference or read sentiment evaluation files directly.

## Model Artifact Policy

MS-07 does not train IndoBERT, download model weights, or copy model artifacts into the service folder. Model artifacts remain local runtime files and must not be committed.

The Docker Compose service can mount a local model directory read-only:

```yaml
volumes:
  - ./ml-service/saved_models/indobert:/app/models/indobert:ro
environment:
  SENTIMENT_MODEL_DIR: /app/models/indobert
```

If the model artifact is unavailable, the prediction endpoint returns deterministic fallback demo output with `mode: "fallback"` and an explicit warning. This fallback is for service integration and frontend demo behavior only; it is not real IndoBERT inference.

## Research Output Strategy

Summary and evaluation endpoints read small generated research outputs when available:

- `datasets/outputs/eda/05_evaluation/model_evaluation_summary.json`
- `datasets/outputs/eda/03_indobert/run_*/indobert_training_metrics.json`
- `datasets/outputs/eda/03_indobert/run_*/indobert_classification_report.json`
- sentiment distribution files under `datasets/outputs/eda/01_data_acquisition/` and `02_preprocessing/`

Missing files are returned as warnings instead of crashing the service.

## Gateway Routes

Frontend clients should call only:

- `POST http://localhost:8000/sentiment/predict`
- `GET http://localhost:8000/sentiment/summary`
- `GET http://localhost:8000/sentiment/evaluation`

Internal routing:

```text
frontend-service -> api-gateway-service -> sentiment-service
```

## Limitations

- The prediction endpoint is fallback-only in MS-07 unless a safe local model loader is added in a later phase.
- Production model serving can be improved later with explicit artifact packaging, cold-start handling, and resource limits.
- Legacy `ml-service` remains available during the migration and is not removed by this extraction.
