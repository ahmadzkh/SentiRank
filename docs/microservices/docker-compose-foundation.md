# Docker Compose Foundation for SentiRank Microservices

## Purpose

This document describes the MS-03 Docker Compose foundation for SentiRank's gradual transition from a modular monolith toward a microservice architecture.

MS-03 provides infrastructure scaffolding only. It creates the deployment topology, service names, ports, health-check endpoints, and shared Docker network. It does not extract business logic from `ml-service`, does not implement API Gateway routing, and does not replace the existing frontend or ML workflows.

## Service List

| Service | Container name | Port | MS-03 status |
| --- | --- | ---: | --- |
| `frontend-service` | `sentirank-frontend-service` | 3000 | Usable development container for the existing Next.js frontend |
| `api-gateway-service` | `sentirank-api-gateway-service` | 8000 | Skeleton FastAPI service with root and health endpoints |
| `review-service` | `sentirank-review-service` | 8001 | Skeleton FastAPI service with root and health endpoints |
| `sentiment-service` | `sentirank-sentiment-service` | 8002 | Placeholder health-check service only |
| `aspect-service` | `sentirank-aspect-service` | 8003 | Placeholder health-check service only |
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

## Transition Notes

`ml-service` remains the legacy modular backend during the transition. Existing research notebooks, scripts, model outputs, and AHP/Fuzzy AHP backend logic remain where they are.

Planned next steps:

1. MS-05 implements API Gateway routing to internal services.
2. Later phases extract review, sentiment, aspect, and report responsibilities step by step.

This keeps the refactor controlled and avoids breaking the completed ML and frontend workflows while still establishing a concrete microservice deployment foundation.
