# SentiRank

SentiRank is a thesis-stage decision-support dashboard for Spotify review analysis. It combines IndoBERT sentiment inference, SVM aspect classification, and AHP/Fuzzy AHP research results behind a Next.js frontend and FastAPI microservices.

## Active Architecture

```text
Next.js frontend
  -> API Gateway
     -> review-service
     -> sentiment-service (IndoBERT)
     -> aspect-service (SVM)
     -> decision-service (AHP/Fuzzy AHP)
     -> report-service (Dashboard aggregation)
  -> API Gateway repository persistence for runtime inference history
```

The frontend calls the API Gateway only. It does not call internal service ports, read CSV/JSON files directly, or calculate AHP/Fuzzy AHP. The standalone Reports page and print-report feature are out of the current thesis demo scope; `report-service` remains active as a Dashboard/evaluation/ranking aggregation service.

## Local Demo

Start the default backend stack with SQLite runtime persistence:

```bash
docker compose up --build
```

Run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in the frontend environment.

Optional Compose modes:

```bash
# Include the frontend container
docker compose --profile frontend up --build

# Include PostgreSQL after setting API_GATEWAY_DATABASE_URL
docker compose --profile postgres up --build
```

Key server-side variables include `API_GATEWAY_DATABASE_URL`, `DATABASE_URL`, `REVIEW_SERVICE_URL`, `SENTIMENT_SERVICE_URL`, `ASPECT_SERVICE_URL`, `DECISION_SERVICE_URL`, `REPORT_SERVICE_URL`, `SENTIMENT_MODEL_SOURCE`, `INDOBERT_MODEL_PATH`, `INDOBERT_MODEL_ID`, `HF_TOKEN`, and `SVM_ASPECT_MODEL_PATH`. Use `.env.example` and `frontend/.env.example` as templates; never commit real secrets.

## Data and Models

- Research CSV/JSON artifacts remain reproducible, read-only thesis outputs for datasets, preprocessing, evaluation, AHP/Fuzzy AHP, ranking comparison, and Dashboard snapshots.
- Runtime inference history stores user-submitted text, predictions, model/provenance metadata, and timestamps through the API Gateway repository.
- SQLite is the local/demo default; PostgreSQL is optional for deployment.
- Legacy Prisma files have been removed and Prisma is not part of runtime persistence.
- Local artifacts under `ml-service/saved_models/` are ignored by Git. Services can use read-only local mounts; sentiment serving also supports a configured Hugging Face model id.

## Deployment Modes

| Mode | Frontend | Backend | Database | Model source |
| --- | --- | --- | --- | --- |
| Local full demo | Local `npm run dev` or Compose `frontend` profile | Docker Compose default stack | SQLite | Read-only local artifacts or Hugging Face id |
| Semi-online demo | Vercel | Local Docker backend through a tunnel | Local SQLite | Local backend artifacts or Hugging Face id |
| Full online, if required | Vercel | Container-capable platform | Managed PostgreSQL | Hugging Face/private model repository or platform-managed artifact |

Vercel hosts the frontend only; it does not run the full Docker Compose backend.

## Repository Roles

| Path | Role |
| --- | --- |
| `frontend/` | Next.js UI and API Gateway client layer. |
| `services/` | Active API Gateway and domain runtime microservices. |
| `ml-service/` | Research scripts, notebooks, quality audits, model utilities, and legacy experiment runtime code; not the primary runtime service layer. |
| `datasets/` | Research datasets and generated research outputs. |
| `docs/` | Thesis, methodology, frontend, and architecture documentation. |
| `ml-service/saved_models/` | Local Git-ignored model artifacts. |

See `docs/microservices/architecture.md` for canonical service ownership and `docs/microservices/docker-compose-foundation.md` for detailed runtime commands.
