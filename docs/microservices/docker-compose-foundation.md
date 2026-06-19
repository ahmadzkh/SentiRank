# Docker Compose Foundation for SentiRank Microservices

## Purpose

This document describes the MS-03 Docker Compose foundation for SentiRank's gradual transition from a modular monolith toward a microservice architecture.

MS-03 provides infrastructure scaffolding only. It creates the deployment topology, service names, ports, health-check endpoints, and shared Docker network. It does not extract business logic from `ml-service`, does not implement API Gateway routing, and does not replace the existing frontend or ML workflows.

## Service List

| Service | Container name | Port | MS-03 status |
| --- | --- | ---: | --- |
| `frontend-service` | `sentirank-frontend-service` | 3000 | Usable development container for the existing Next.js frontend |
| `api-gateway-service` | `sentirank-api-gateway-service` | 8000 | Public API Gateway with service routing and runtime inference persistence as of MS-12A |
| `review-service` | `sentirank-review-service` | 8001 | Extracted read-only review/data summary service as of MS-06 |
| `sentiment-service` | `sentirank-sentiment-service` | 8002 | Extracted sentiment prediction and evaluation summary service as of MS-07 |
| `aspect-service` | `sentirank-aspect-service` | 8003 | Extracted aspect classification and SVM evaluation summary service as of MS-08 |
| `decision-service` | `sentirank-decision-service` | 8004 | Extracted AHP/Fuzzy AHP calculation service as of MS-04 |
| `report-service` | `sentirank-report-service` | 8005 | Active dashboard/evaluation/ranking aggregation service; kept in MS-13D |
| `database-service` | `sentirank-database-service` | 5432 | PostgreSQL container for thesis-stage Compose topology |

## Run the Compose Stack

From the repository root:

```bash
docker compose up --build
```

The frontend container receives:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The frontend should call only the API Gateway public port. Internal service URLs are configured for the gateway container through Docker Compose environment variables.

As of MS-12A, the gateway also receives:

```bash
API_GATEWAY_DATABASE_URL=postgresql://sentirank:sentirank@database-service:5432/sentirank
```

This database URL is used only for user-submitted runtime inference history. Research CSV/JSON artifacts remain file-based and are not migrated into PostgreSQL.

## Stop the Compose Stack

```bash
docker compose down
```

To remove the PostgreSQL development volume, run this only when local database state can be discarded:

```bash
docker compose down -v
```

## Health Checks

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

## Skeleton Scope

The backend service folders under `services/` are intentionally minimal:

```text
services/<service-name>/
  app/
    __init__.py
    main.py
  Dockerfile
  requirements.txt
```

Most skeleton services expose only:

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

`ml-service` remains the legacy modular backend during the transition. Existing research notebooks, scripts, model outputs, and AHP/Fuzzy AHP backend logic remain where they are.

Planned next steps:

1. Later phases can replace file-based report aggregation with database-backed persistence if needed.
2. Later phases replace remaining legacy boundaries step by step.

This keeps the refactor controlled and avoids breaking the completed ML and frontend workflows while still establishing a concrete microservice deployment foundation.
