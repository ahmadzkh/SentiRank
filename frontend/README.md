# SentiRank Frontend

Next.js 15 user interface for the SentiRank thesis dashboard.

## Runtime Boundary

The frontend calls the FastAPI API Gateway only. Browser-facing requests use `NEXT_PUBLIC_API_BASE_URL`; server-side Docker requests may use `API_GATEWAY_INTERNAL_URL` to reach the same gateway. Frontend code must not call internal microservice ports, read research CSV/JSON files directly, or calculate AHP/Fuzzy AHP.

Gateway-backed pages show explicit unavailable/empty states when the backend cannot be reached. Historical mock data may remain as design reference, but it is not a live demo fallback.

## Setup

```bash
npm install
npm run dev
```

Local environment:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run build
```

## Current Scope

- Dashboard is the main summary/reporting surface.
- The standalone `/reports` page/menu and print-report feature are removed from current thesis demo scope.
- Backend `report-service` remains active behind the API Gateway for Dashboard, evaluation, and ranking aggregation.
- The AHP/Fuzzy AHP page displays read-only result data; it has no calculation action.
- Current AHP/Fuzzy AHP outputs remain sample/development until validated expert judgement is available.
- Local development uses `npm run dev`; the Docker `frontend` profile is optional; Vercel can host the frontend for semi-online/full-online modes but does not run the backend Compose stack.

Use `frontend/DESIGN.md` as the canonical visual specification and `docs/frontend/frontend-tasks.md` for implementation history and acceptance criteria.
