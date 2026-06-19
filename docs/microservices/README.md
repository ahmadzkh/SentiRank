# SentiRank Microservice Architecture

This folder contains documentation for the target SentiRank microservice architecture.

- `architecture.md` defines the target service boundaries, migration strategy, deployment topology, and thesis-stage limitations.
- `api-contract.md` defines the API Gateway and internal service endpoint contracts.
- `docker-compose-foundation.md` explains the MS-03 Compose topology, skeleton service ports, and health-check workflow.
- `decision-service-extraction.md` documents the MS-04 extraction of AHP/Fuzzy AHP calculations into `decision-service`.
- `api-gateway-implementation.md` documents the MS-05 gateway routing layer for frontend-facing AHP/Fuzzy AHP APIs.
- `review-service-extraction.md` documents the MS-06 extraction of review/data summary endpoints into `review-service`.
- `sentiment-service-extraction.md` documents the MS-07 extraction of sentiment prediction, summary, and evaluation endpoints into `sentiment-service`.
- `aspect-service-extraction.md` documents the MS-08 extraction of aspect classification, summary, and SVM evaluation endpoints into `aspect-service`.
- `report-service-extraction.md` documents the MS-09 extraction of report and consolidated evaluation aggregation endpoints into `report-service`.
- `runtime-inference-persistence.md` documents the MS-12A runtime review inference flow and database persistence boundary.

MS-01 and MS-02 are documentation-only planning artifacts. MS-03 adds Docker Compose and minimal health-check skeletons. MS-04 extracts decision-support calculations into `decision-service`. MS-05 routes frontend-facing AHP/Fuzzy AHP API paths through `api-gateway-service`. MS-06 extracts review/data summaries into `review-service` and exposes them through the gateway. MS-07 extracts sentiment-domain endpoints into `sentiment-service`. MS-08 extracts aspect-domain endpoints into `aspect-service`. MS-09 extracts report/evaluation aggregation into `report-service`. MS-12A adds backend runtime review inference orchestration and database persistence for user-submitted inference history only.
