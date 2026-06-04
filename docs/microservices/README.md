# SentiRank Microservice Architecture

This folder contains documentation for the target SentiRank microservice architecture.

- `architecture.md` defines the target service boundaries, migration strategy, deployment topology, and thesis-stage limitations.
- `api-contract.md` defines the API Gateway and internal service endpoint contracts.
- `docker-compose-foundation.md` explains the MS-03 Compose topology, skeleton service ports, and health-check workflow.
- `decision-service-extraction.md` documents the MS-04 extraction of AHP/Fuzzy AHP calculations into `decision-service`.
- `api-gateway-implementation.md` documents the MS-05 gateway routing layer for frontend-facing AHP/Fuzzy AHP APIs.

MS-01 and MS-02 are documentation-only planning artifacts. MS-03 adds Docker Compose and minimal health-check skeletons. MS-04 extracts decision-support calculations into `decision-service`. MS-05 routes frontend-facing AHP/Fuzzy AHP API paths through `api-gateway-service`.
