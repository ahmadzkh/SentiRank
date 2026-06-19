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

MS-11B prepares the export workflow for a Hugging Face-compatible artifact at:

```text
ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5/
```

That workflow records tokenizer files, label mapping, evaluation metrics, preprocessing metadata, training configuration, and a model card beside the exported model weights.

MS-11C enables `sentiment-service` to load that exported artifact for real IndoBERT inference when available. The service supports both local artifact loading and Hugging Face model loading:

```env
SENTIMENT_MODEL_SOURCE=auto
INDOBERT_MODEL_PATH=ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5
INDOBERT_MODEL_ID=ahmadzkh/sentirank-indobert-run3
INDOBERT_MODEL_NAME=run_3_weighted_loss_lr_1e-5
INDOBERT_MAX_LENGTH=128
HF_TOKEN=
```

`SENTIMENT_MODEL_SOURCE=auto` prefers the local artifact when it exists and can be loaded, then tries `INDOBERT_MODEL_ID`, then falls back explicitly. Use `local` to require local artifact loading only, or `hf` to require Hugging Face loading only. Private Hugging Face repositories require `HF_TOKEN`, but tokens must stay in environment variables and must never be committed or returned by an API response.

The Docker Compose service can mount a local model directory read-only:

```yaml
volumes:
  - ./ml-service/saved_models/indobert:/app/models/indobert:ro
environment:
  SENTIMENT_MODEL_SOURCE: auto
  INDOBERT_MODEL_PATH: /app/models/indobert/run_3_weighted_loss_lr_1e-5
  INDOBERT_MODEL_ID: ahmadzkh/sentirank-indobert-run3
  INDOBERT_MODEL_NAME: run_3_weighted_loss_lr_1e-5
  INDOBERT_MAX_LENGTH: 128
  HF_TOKEN: ""
```

If the model artifact is available and loadable, the prediction endpoint returns real model output with `mode: "model"`, `prediction_source: "model"`, `model_available: true`, and `is_fallback: false`.

If the model artifact is unavailable, the prediction endpoint returns deterministic fallback output with `mode: "fallback"`, `prediction_source: "fallback_rule"`, `model_available: false`, `is_fallback: true`, and an explicit warning. This fallback is for service continuity only; it is not real IndoBERT inference.

The `ml-service/saved_models/indobert/` tree is ignored by Git. Do not commit `model.safetensors`, `pytorch_model.bin`, `.env`, or token files.

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

- The prediction endpoint uses real IndoBERT inference only when the local artifact or configured Hugging Face model can be loaded.
- Fallback remains explicit when the artifact is unavailable or cannot be loaded; fallback output must not be interpreted as real IndoBERT inference.
- Production model serving can be improved later with stricter resource limits, startup policy, and observability.
- Legacy `ml-service` remains available during the migration and is not removed by this extraction.
