# API Gateway Implementation

## Purpose

MS-05 implements `api-gateway-service` as the single frontend-facing API entry point for SentiRank.

In this phase, the gateway proxies only AHP and Fuzzy AHP routes to `decision-service`. Other internal services remain future extraction targets and are only represented in health aggregation when available.

## Gateway Role

The frontend should call:

```text
http://localhost:8000
```

The frontend must not call internal service ports directly.

Current gateway-owned public routes:

- `GET /`
- `GET /health`
- `GET /health/services`
- `GET /ahp/criteria`
- `POST /ahp/calculate`
- `POST /ahp/fuzzy-calculate`
- `POST /ahp/compare`

## AHP/Fuzzy AHP Routing

The gateway forwards AHP routes to `decision-service`:

| Public gateway route | Internal service route |
| --- | --- |
| `GET /ahp/criteria` | `GET {DECISION_SERVICE_URL}/ahp/criteria` |
| `POST /ahp/calculate` | `POST {DECISION_SERVICE_URL}/ahp/calculate` |
| `POST /ahp/fuzzy-calculate` | `POST {DECISION_SERVICE_URL}/ahp/fuzzy-calculate` |
| `POST /ahp/compare` | `POST {DECISION_SERVICE_URL}/ahp/compare` |

`decision-service` owns AHP, Fuzzy AHP, and ranking-comparison calculation logic. The gateway only forwards JSON payloads and preserves the upstream response envelope.

## Environment Configuration

Docker Compose sets:

```text
DECISION_SERVICE_URL=http://decision-service:8004
REVIEW_SERVICE_URL=http://review-service:8001
SENTIMENT_SERVICE_URL=http://sentiment-service:8002
ASPECT_SERVICE_URL=http://aspect-service:8003
REPORT_SERVICE_URL=http://report-service:8005
```

For local non-Docker development, the gateway falls back to:

```text
DECISION_SERVICE_URL=http://127.0.0.1:8004
```

## Response Behavior

When `decision-service` returns a standard envelope, the gateway preserves it:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

If `decision-service` is unavailable, the gateway returns:

```json
{
  "success": false,
  "message": "Decision service is unavailable.",
  "error": {
    "code": "DECISION_SERVICE_UNAVAILABLE",
    "details": {}
  }
}
```

Timeouts and invalid upstream JSON responses are also converted into explicit gateway error envelopes.

## Health Checks

Gateway health:

```text
GET http://localhost:8000/health
```

Internal service health aggregation:

```text
GET http://localhost:8000/health/services
```

The aggregation endpoint checks `decision-service` and attempts placeholder service checks for review, sentiment, aspect, and report services. Unavailable placeholder services do not fail the whole endpoint.

## CORS

MS-05 enables CORS for frontend development origins:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

This is suitable for the thesis demo environment. A production deployment should restrict origins to the deployed frontend domain.

## Docker Compose

Run from the repository root:

```bash
docker compose up --build
```

For targeted gateway validation:

```bash
docker compose up -d decision-service api-gateway-service
curl http://localhost:8000/health
curl http://localhost:8000/health/services
curl http://localhost:8000/ahp/criteria
```

## Scope Boundary

MS-05 does not:

- calculate AHP or Fuzzy AHP in the gateway
- modify frontend code
- modify `decision-service` calculation logic
- modify legacy `ml-service`
- implement review, sentiment, aspect, or report business logic
- add authentication or session/user identity
