# Decision Service Extraction

## Purpose

MS-04 extracts the stable AHP, Fuzzy AHP, and AHP-vs-Fuzzy comparison calculation boundary into `decision-service`.

This service is now the target runtime owner for decision-support calculations in the SentiRank microservice architecture. It runs on port `8004` and exposes the AHP/Fuzzy AHP endpoints defined in the microservice API contract.

## Implemented Endpoints

The extracted service exposes:

- `GET /`
- `GET /health`
- `GET /ahp/criteria`
- `POST /ahp/calculate`
- `POST /ahp/fuzzy-calculate`
- `POST /ahp/compare`

All successful responses use the shared SentiRank response envelope:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Service-level validation errors use:

```json
{
  "success": false,
  "message": "...",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {}
  }
}
```

FastAPI/Pydantic request validation errors may still use the standard FastAPI `422` response body.

## Criteria Ownership

`GET /ahp/criteria` returns the final five SentiRank decision criteria:

1. `C1` - Features, Content & Audio Experience
2. `C2` - App Reliability & Usability
3. `C3` - Ads Experience
4. `C4` - Subscription & Pricing
5. `C5` - Account/Login

The criteria are hardcoded in the service for runtime stability. Documentation templates remain useful for research and expert-judgement collection, but the service does not depend on those files at runtime.

## Legacy Compatibility

The legacy `ml-service` AHP/Fuzzy AHP implementation remains in place temporarily. MS-04 does not delete, move, or disable the existing legacy endpoints.

The extraction is intentionally duplicated for this transition phase:

- `ml-service` remains the legacy modular backend.
- `decision-service` becomes the extracted microservice boundary.
- API Gateway routing to `decision-service` is still deferred to MS-05.

## Frontend Integration

The frontend is not modified in MS-04.

After MS-05, frontend requests should flow through:

```text
frontend-service -> api-gateway-service -> decision-service
```

The frontend should not call `decision-service:8004` directly.

## Out of Scope

MS-04 does not implement:

- API Gateway routing
- database persistence
- authentication
- expert judgement storage
- review, sentiment, aspect, or report services
- AHP/Fuzzy AHP algorithm changes
- frontend UI changes
