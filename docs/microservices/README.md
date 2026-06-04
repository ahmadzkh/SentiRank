# SentiRank Microservice Architecture

This folder contains documentation for the target SentiRank microservice architecture.

- `architecture.md` defines the target service boundaries, migration strategy, deployment topology, and thesis-stage limitations.
- `api-contract.md` defines the API Gateway and internal service endpoint contracts.
- `docker-compose-foundation.md` explains the MS-03 Compose topology, skeleton service ports, and health-check workflow.

MS-01 and MS-02 are documentation-only planning artifacts. MS-03 adds Docker Compose and minimal health-check skeletons, but it still does not extract business logic, implement API Gateway routing, or change frontend UI behavior.
