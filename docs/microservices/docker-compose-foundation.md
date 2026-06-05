# Docker Compose Foundation for SentiRank Microservices

## Purpose

This document describes the MS-03 Docker Compose foundation for SentiRank's gradual transition from a modular monolith toward a microservice architecture.

MS-03 provides infrastructure scaffolding only. It creates the deployment topology, service names, ports, health-check endpoints, and shared Docker network. It does not extract business logic from `ml-service`, does not implement API Gateway routing, and does not replace the existing frontend or ML workflows.

## Service List

| Service | Container name | Port | MS-03 status |
| --- | --- | ---: | --- |
| `frontend-service` | `sentirank-frontend-service` | 3000 | Usable development container for the existing Next.js frontend |
| `api-gateway-service` | `sentirank-api-gateway-service` | 8000 | Skeleton FastAPI service with root and health endpoints |
| `review-service` | `sentirank-review-service` | 8001 | Extracted read-only review/data summary service as of MS-06 |
| `sentiment-service` | `sentirank-sentiment-service` | 8002 | Extracted sentiment prediction and evaluation summary service as of MS-07 |
| `aspect-service` | `sentirank-aspect-service` | 8003 | Extracted aspect classification and SVM evaluation summary service as of MS-08 |
| `decision-service` | `sentirank-decision-service` | 8004 | Extracted AHP/Fuzzy AHP calculation service as of MS-04 |
| `report-service` | `sentirank-report-service` | 8005 | Placeholder health-check service only |
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

Optional placeholder services also expose:

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
```

If no local model artifact is mounted, `sentiment-service` keeps the API usable with explicitly marked fallback demo predictions.

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

## Transition Notes

`ml-service` remains the legacy modular backend during the transition. Existing research notebooks, scripts, model outputs, and AHP/Fuzzy AHP backend logic remain where they are.

Planned next steps:

1. MS-09 extracts report-service responsibilities.
2. Later phases replace remaining legacy boundaries step by step.

This keeps the refactor controlled and avoids breaking the completed ML and frontend workflows while still establishing a concrete microservice deployment foundation.
