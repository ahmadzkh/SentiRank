# Runtime Review Inference Persistence

## Purpose

MS-12A adds a backend-only runtime inference flow for user-submitted review text:

```text
User review text
-> api-gateway-service
-> sentiment-service
-> aspect-service
-> runtime database history
-> API Gateway response
```

This flow is for interactive runtime inference history only. It does not migrate SentiRank research CSV/JSON artifacts, model outputs, AHP/Fuzzy AHP outputs, notebooks, or report snapshots into the database.

## Service Ownership

`api-gateway-service` owns the public runtime inference endpoints:

- `POST /inference/review`
- `GET /inference/history`
- `GET /inference/health`

The gateway orchestrates calls to:

- `sentiment-service` through `POST /sentiment/predict`
- `aspect-service` through `POST /aspects/classify`

The gateway does not calculate sentiment or aspect results locally. It preserves downstream metadata such as `prediction_source`, `model_available`, and `is_fallback`.

## Persistence Boundary

Runtime records are stored in `runtime_review_inference_history`. Stored fields include:

- input review text
- sentiment label, confidence, probabilities, model name, mode, prediction source, model availability, and fallback flag
- aspect label, confidence, scores, model name, mode, prediction source, model availability, and fallback flag
- warnings, request source, and `created_at`

No `userId`, `sessionId`, login, or authentication fields are stored in this thesis-stage implementation.

## Database Configuration

The API Gateway reads database configuration from:

- `API_GATEWAY_DATABASE_URL`
- fallback: `DATABASE_URL`

Local/demo Docker Compose defaults to SQLite:

```text
API_GATEWAY_DATABASE_URL=sqlite:///./runtime_inference_history.db
```

SQLite URLs are also supported for local tests and non-Docker development, for example:

```text
sqlite:///./runtime_inference_history.db
```

PostgreSQL remains available for deployment-like Compose runs through the optional `postgres` profile:

```text
API_GATEWAY_DATABASE_URL=postgresql://sentirank:sentirank@database-service:5432/sentirank
docker compose --profile postgres up --build
```

The gateway creates the runtime inference table if it does not exist. This is intentionally minimal for thesis-stage runtime persistence.

Prisma is not part of this runtime persistence path. MS-13E removed the legacy `prisma/` schema directory and `prisma.config.ts`; inference history remains handled by API Gateway repository code with SQLite for local/demo use and PostgreSQL for deployment. MS-13F keeps PostgreSQL support but no longer requires the PostgreSQL container for the ordinary local backend demo.

## Failure Behavior

If input text is empty or too long, the gateway returns a controlled Bahasa Indonesia validation response.

If sentiment-service or aspect-service fails, the gateway returns an explicit error. It does not invent fake sentiment or aspect results.

If prediction succeeds but persistence fails, the gateway returns the combined inference result with `saved=false` and a persistence warning. This keeps the runtime demo useful without pretending the record was stored.

## Research Artifact Policy

Research artifacts remain the source for reproducible thesis evidence:

- datasets and preprocessing outputs
- model evaluation JSON/CSV files
- AHP/Fuzzy AHP sample and final outputs
- report snapshots

Those artifacts are not copied into the runtime database by MS-12A.
