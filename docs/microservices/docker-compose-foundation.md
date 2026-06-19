# Docker Compose Foundation for SentiRank Microservices

## Purpose

This document is the local/demo Docker Compose runtime reference for SentiRank's thesis-stage microservices.

The Compose file began as the MS-03 infrastructure scaffold. The extraction work is now active: backend microservices run by default with SQLite inference-history persistence, the frontend container is optional, and PostgreSQL remains available through an opt-in profile.

## Service List

| Service | Container name | Port | MS-13F local/demo status |
| --- | --- | ---: | --- |
| `api-gateway-service` | `sentirank-api-gateway-service` | 8000 | Required. Public API Gateway, service routing, health aggregation, and runtime inference persistence owner. |
| `review-service` | `sentirank-review-service` | 8001 | Required for local backend demo. Read-only review/data summary service. |
| `sentiment-service` | `sentirank-sentiment-service` | 8002 | Required for local backend demo. Sentiment summary/evaluation/inference service with optional IndoBERT artifact mount. |
| `aspect-service` | `sentirank-aspect-service` | 8003 | Required for local backend demo. Aspect summary/evaluation/inference service with optional SVM artifact mount. |
| `decision-service` | `sentirank-decision-service` | 8004 | Required for local backend demo. AHP/Fuzzy AHP calculation service. |
| `report-service` | `sentirank-report-service` | 8005 | Required for current Dashboard/evaluation/ranking aggregation routes; kept in MS-13D. |
| `frontend-service` | `sentirank-frontend-service` | 3000 | Optional profile `frontend`. Useful for full local Docker demo; local `npm run dev` and future Vercel deployment are also valid. |
| `database-service` | `sentirank-database-service` | 5432 | Optional profile `postgres`. Use for deployment-like PostgreSQL mode; SQLite is the local/demo default. |

## Run the Compose Stack

### Local backend demo with SQLite

From the repository root:

```bash
docker compose up --build
```

This starts the backend microservices on the shared Docker network:

- `api-gateway-service`
- `review-service`
- `sentiment-service`
- `aspect-service`
- `decision-service`
- `report-service`

The API Gateway receives:

```bash
API_GATEWAY_DATABASE_URL=sqlite:///./runtime_inference_history.db
```

This SQLite database is used only for user-submitted runtime inference history. Research CSV/JSON artifacts remain file-based and are not migrated into SQLite or PostgreSQL.

### Optional frontend container

For a full local Docker demo that includes the Next.js container:

```bash
docker compose --profile frontend up --build
```

The frontend container receives:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The frontend should call only the API Gateway public port. Internal service URLs are configured for the gateway container through Docker Compose environment variables. Local frontend development through `npm run dev` remains valid, and a future Vercel frontend should point `NEXT_PUBLIC_API_BASE_URL` to the API Gateway or tunnel URL.

### Optional PostgreSQL mode

PostgreSQL remains available for deployment-like local runs. Set the gateway database URL to the Compose database service, then start the `postgres` profile:

```bash
API_GATEWAY_DATABASE_URL=postgresql://sentirank:sentirank@database-service:5432/sentirank
docker compose --profile postgres up --build
```

On PowerShell:

```powershell
$env:API_GATEWAY_DATABASE_URL = "postgresql://sentirank:sentirank@database-service:5432/sentirank"
docker compose --profile postgres up --build
```

To run both the optional frontend container and PostgreSQL:

```bash
docker compose --profile frontend --profile postgres up --build
```

Prisma is not used in the current Docker topology. MS-13E removed the legacy Prisma schema/config files; API Gateway repository persistence owns runtime inference history for both SQLite local/demo mode and PostgreSQL deployment mode.

### Environment variables

Key variables are documented in `.env.example`:

| Area | Variables | Notes |
| --- | --- | --- |
| Frontend | `NEXT_PUBLIC_API_BASE_URL` | Browser-facing API Gateway URL. Use `http://localhost:8000` for local demo or a tunnel/backend URL for semi-online demo. |
| API Gateway | `API_GATEWAY_DATABASE_URL`, `DATABASE_URL` | SQLite is the local/demo default. PostgreSQL remains optional through the `postgres` profile or managed database URL. |
| Service URLs | `REVIEW_SERVICE_URL`, `SENTIMENT_SERVICE_URL`, `ASPECT_SERVICE_URL`, `DECISION_SERVICE_URL`, `REPORT_SERVICE_URL` | Internal Docker service names. Frontend code must not call these directly. |
| Sentiment model | `SENTIMENT_MODEL_SOURCE`, `INDOBERT_MODEL_PATH`, `INDOBERT_MODEL_ID`, `INDOBERT_MODEL_NAME`, `INDOBERT_MAX_LENGTH`, `HF_TOKEN` | Do not commit a real `HF_TOKEN`. Compose mounts local IndoBERT artifacts read-only and can also use a configured Hugging Face model id. |
| Aspect model | `ASPECT_MODEL_DIR`, `SVM_ASPECT_MODEL_PATH` | Compose mounts the SVM artifact directory read-only. |

## Stop the Compose Stack

```bash
docker compose down
```

To remove the optional PostgreSQL development volume, run this only when local database state can be discarded:

```bash
docker compose down -v
```

## Health Checks

Compose defines lightweight healthchecks for backend services using existing `/health` endpoints. These checks do not run model inference.

After starting the stack, these endpoints should return the standard SentiRank response envelope:

```text
http://localhost:8000/health
http://localhost:8001/health
http://localhost:8004/health
```

Additional extracted services also expose:

```text
http://localhost:8002/health
http://localhost:8003/health
http://localhost:8005/health
```

Each health response follows:

```json
{
  "success": true,
  "message": "Service is healthy.",
  "data": {
    "service": "decision-service",
    "status": "healthy",
    "port": 8004,
    "stage": "ms_03_skeleton"
  }
}
```

## Service Evolution and Current Capabilities

The service folders began as minimal MS-03 healthcheck skeletons. They now contain the active API Gateway and domain runtimes:

```text
services/<service-name>/
  app/
    __init__.py
    main.py
  Dockerfile
  requirements.txt
```

Every backend service exposes at least:

- `GET /`
- `GET /health`

As of MS-04, `decision-service` additionally exposes:

- `GET /ahp/criteria`
- `POST /ahp/calculate`
- `POST /ahp/fuzzy-calculate`
- `POST /ahp/compare`

As of MS-06, `review-service` additionally exposes:

- `GET /reviews/random`
- `GET /dataset/summary`
- `GET /scraping/summary`
- `GET /preprocessing/summary`

`review-service` mounts repository research outputs as read-only Docker volumes:

```yaml
volumes:
  - ./datasets:/app/datasets:ro
  - ./docs:/app/docs:ro
environment:
  DATASETS_DIR: /app/datasets
  DOCS_DIR: /app/docs
```

As of MS-07, `sentiment-service` additionally exposes:

- `POST /sentiment/predict`
- `GET /sentiment/summary`
- `GET /sentiment/evaluation`

`sentiment-service` mounts repository research outputs and the optional local IndoBERT artifact directory as read-only Docker volumes:

```yaml
volumes:
  - ./datasets:/app/datasets:ro
  - ./docs:/app/docs:ro
  - ./ml-service/saved_models/indobert:/app/models/indobert:ro
environment:
  DATASETS_DIR: /app/datasets
  DOCS_DIR: /app/docs
  SENTIMENT_MODEL_DIR: /app/models/indobert
  SENTIMENT_MODEL_SOURCE: auto
  INDOBERT_MODEL_PATH: /app/models/indobert/run_3_weighted_loss_lr_1e-5
  INDOBERT_MODEL_ID: ahmadzkh/sentirank-indobert-run3
  INDOBERT_MODEL_NAME: run_3_weighted_loss_lr_1e-5
  INDOBERT_MAX_LENGTH: 128
  HF_TOKEN: ""
```

If the local model artifact is mounted and loadable, `sentiment-service` uses real IndoBERT inference. If no local artifact is available and no configured Hugging Face model can be loaded, it keeps the API usable with explicitly marked fallback predictions.

As of MS-08, `aspect-service` additionally exposes:

- `POST /aspects/classify`
- `GET /aspects/summary`
- `GET /aspects/evaluation`

`aspect-service` mounts repository research outputs and the optional local SVM artifact directory as read-only Docker volumes:

```yaml
volumes:
  - ./datasets:/app/datasets:ro
  - ./docs:/app/docs:ro
  - ./ml-service/saved_models/svm:/app/models/svm:ro
environment:
  DATASETS_DIR: /app/datasets
  DOCS_DIR: /app/docs
  ASPECT_MODEL_DIR: /app/models/svm
  SVM_ASPECT_MODEL_PATH: /app/models/svm/svm_merged_5class_pipeline.joblib
```

If no local SVM artifact is mounted, `aspect-service` keeps the API usable with explicitly marked fallback demo classifications.

As of MS-09, `report-service` additionally exposes:

- `GET /reports/summary`
- `GET /evaluation/summary`
- `GET /reports/ranking-comparison`

`report-service` mounts repository research outputs as read-only Docker volumes:

```yaml
volumes:
  - ./datasets:/app/datasets:ro
  - ./docs:/app/docs:ro
environment:
  DATASETS_DIR: /app/datasets
  DOCS_DIR: /app/docs
```

`report-service` aggregates existing generated outputs only. It does not train models, run scraping/preprocessing, calculate final AHP/Fuzzy AHP expert rankings, or provide a frontend printable Reports page.

MS-13D keeps `report-service` in Docker Compose because API Gateway still proxies active Dashboard, Model Evaluation, and AHP/Fuzzy AHP data routes to it. The removed frontend Reports page/menu does not remove this backend aggregation dependency.

## Transition Notes

`ml-service/` remains the research pipeline for notebooks, scripts, quality audits, model outputs, and experiment utilities. Its `app/` folder is legacy pre-extraction runtime code; active frontend-facing services live under `services/`.

The current deployment modes are intentionally separate:

| Mode | Frontend | Backend | Runtime database |
| --- | --- | --- | --- |
| Local demo | Local `npm run dev` or optional `frontend` profile | Docker Compose backend services | SQLite by default |
| Semi-online demo | Vercel | Local backend exposed through a tunnel | Local SQLite |
| Full online, if requested | Vercel | Container platform | Managed PostgreSQL |

Model binary safety rules:

- `ml-service/saved_models/` stays ignored by Git.
- Compose mounts model artifacts read-only.
- Do not copy model binaries into Docker images when a read-only mount or private model repository is available.
- Do not commit `model.safetensors`, `pytorch_model.bin`, `*.pt`, `*.pth`, or `*.ckpt`.

Future work can improve domain-owned artifact packaging, production observability, resource controls, and managed deployment if those are required. File-based report aggregation should move only when a concrete database query or lifecycle need justifies the migration.
