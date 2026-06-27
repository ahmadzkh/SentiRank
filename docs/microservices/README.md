# SentiRank Microservice Documentation

This folder documents the active thesis-stage runtime architecture and its historical extraction milestones.

## Current References

- `architecture.md`: canonical runtime topology, service ownership, data-source policy, persistence boundary, and deployment modes.
- `api-contract.md`: public API Gateway and internal service contracts.
- `docker-compose-foundation.md`: local/demo Compose commands, optional profiles, healthchecks, and model mounts.
- `runtime-inference-persistence.md`: API Gateway orchestration and SQLite/PostgreSQL inference-history persistence.
- `repository-hygiene-audit.md`: MS-13 cleanup decisions and residual risks.

## Service Extraction Records

- `decision-service-extraction.md`: AHP/Fuzzy AHP ownership in `decision-service`.
- `api-gateway-implementation.md`: API Gateway routing and frontend boundary.
- `review-service-extraction.md`: review, dataset, scraping, and preprocessing summaries.
- `sentiment-service-extraction.md`: IndoBERT inference, evaluation, artifact loading, and explicit fallback behavior.
- `aspect-service-extraction.md`: merged five-class SVM inference, evaluation, and explicit fallback behavior.
- `report-service-extraction.md`: Dashboard/evaluation/ranking aggregation. This is not a printable Reports frontend feature.

## Current State

The frontend calls the API Gateway only. Active runtime services live under `services/`; `ml-service/` remains the research pipeline and contains legacy experiment runtime utilities that are not the primary frontend-facing backend.

Runtime inference history is persisted by API Gateway repository code. SQLite is the local/demo default and PostgreSQL is optional for deployment. Prisma was removed as unused legacy setup. Research CSV/JSON outputs remain read-only thesis artifacts rather than being migrated wholesale into the runtime database.

The standalone frontend Reports page/menu and print action have been removed from current scope. `report-service` remains active because Dashboard, Model Evaluation, and AHP/Fuzzy AHP views still use its aggregation routes through the API Gateway.
