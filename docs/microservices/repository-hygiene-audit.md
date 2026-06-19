# Repository Hygiene Audit

Audit date: 2026-06-19

Milestone: MS-13A

Scope: repository hygiene audit only. No files were deleted, moved, refactored, or removed from Docker Compose. Runtime behavior was not modified.

## 1. Executive Summary

SentiRank is currently a thesis-stage microservice project with a working `frontend/`, active FastAPI services under `services/`, a research-oriented `ml-service/`, artifact-backed datasets under `datasets/`, and documentation under `docs/`.

The repository is mostly organized around the current microservice direction, but several legacy and generated areas need explicit classification before cleanup:

| Area | Classification | Summary | Recommended action |
| --- | --- | --- | --- |
| `frontend/` | KEEP | Active Next.js UI. Frontend calls API Gateway routes through service adapters. | Keep. Clean only obsolete Reports route artifacts in MS-13C. |
| `services/api-gateway/` | KEEP | Active public API boundary and runtime inference persistence owner. | Keep. |
| `services/review-service/` | KEEP | Active read-only review/data summary service. | Keep. |
| `services/sentiment-service/` | KEEP | Active sentiment summary/evaluation/inference service. | Keep. |
| `services/aspect-service/` | KEEP | Active aspect summary/evaluation/inference service. | Keep. |
| `services/decision-service/` | KEEP | Active AHP/Fuzzy AHP calculation and criteria service. | Keep. |
| `services/report-service/` | KEEP | Still called by API Gateway and frontend-backed views through `/evaluation/summary` and `/reports/ranking-comparison`. Its `/reports/summary` endpoint is a backend aggregation endpoint, not an active frontend Reports page dependency. | Keep as Dashboard/evaluation/ranking aggregation service per MS-13D. |
| `ml-service/scripts/` | KEEP | Active research pipeline scripts. | Keep as research pipeline. |
| `ml-service/notebooks/` | KEEP | Research notebooks and experiment documentation. | Keep. |
| `ml-service/app/` | DEPRECATE | Legacy modular FastAPI runtime boundary overlapping extracted services. | Keep for transition; document as legacy, not active frontend runtime. |
| `ml-service/saved_models/` | KEEP | Local model artifacts used by active services through read-only Docker mounts. Git ignored. | Keep; do not inspect or commit binaries. |
| `datasets/` | KEEP | Research datasets and generated outputs used as read-only evidence by services. | Keep. |
| `docs/` | KEEP | Thesis/project documentation. Canonical architecture/runtime docs were synchronized in MS-13G; older design-history files may still contain superseded plans. | Keep current references authoritative and label historical plans clearly. |
| `prisma/`, `prisma.config.ts` | REMOVE LATER / DONE | Prisma schema/migration artifacts were legacy; runtime persistence is implemented in `api-gateway` via repository SQL support. | Removed in MS-13E after final reference audit found no active runtime dependency. |
| Generated caches and local DB files | CLEAN GENERATED | `.pytest_cache/`, service `.pytest_cache/`, `__pycache__/`, `.pyc`, `frontend/node_modules/`, `frontend/.next/`, and `dev.db` exist. | Clean in MS-13B; update `.gitignore` first where missing. |

The most important constraint is that `report-service` is not safe to remove immediately. The Reports frontend menu/page has been removed, but the service still supplies active gateway routes used by Dashboard, AHP/Fuzzy AHP, and Model Evaluation.

## 2. Current Project Role Map

| Path | Current role | Classification | Evidence | Notes |
| --- | --- | --- | --- | --- |
| `README.md` | Current project overview, local run guide, deployment modes, and repository roles. | KEEP | Synchronized in MS-13G with active microservices and persistence policy. | Keep concise. |
| `CLAUDE.md` | Agent/project rules and architecture context. | KEEP / DONE | MS-13G added the active repository role map, current feature status, model serving, and persistence boundaries. | Historical pre-refactor tree is explicitly labeled. |
| `AGENTS.md` | Agent instructions and frontend tracking rules. | KEEP | Defines frontend task tracker expectations. | No change in MS-13A. |
| `docker-compose.yml` | Current multi-service development stack. | KEEP | Defines backend microservices by default, optional frontend container, and optional PostgreSQL profile. | MS-13F made SQLite the local/demo default and kept PostgreSQL for deployment-like runs. |
| `.gitignore` | Git hygiene rules. | TODO | Covers many artifacts but misses root/service pytest cache and some generic generated dirs. | Update in MS-13B before cleanup. |
| `.env.example` | Environment template. | KEEP | Keeps `DATABASE_URL` and `API_GATEWAY_DATABASE_URL` for API Gateway repository persistence. | MS-13E clarified these are not Prisma variables. |
| `prisma/` | Removed legacy Prisma schema and SQLite migration. | REMOVE LATER / DONE | No active runtime Prisma client usage found. | Removed in MS-13E. |
| `services/` | Active runtime microservices. | KEEP | Docker builds and API Gateway routes target these services. | Keep service boundaries. |
| `frontend/app/reports/` | Removed frontend Reports route. | REMOVE LATER / DONE | Removed in MS-13C after it only redirected to `/dashboard`. | Backend report-service remains separate from this page removal. |
| `frontend/services/report-service.ts` | Frontend adapter for ranking endpoints through API Gateway. | KEEP | `getRankingComparison()` is actively used by Dashboard and AHP/Fuzzy AHP; `getReportSummary()` was removed in MS-13C. | Keep until endpoint ownership changes. |
| `ml-service/` | Research pipeline plus legacy runtime. | KEEP / DEPRECATE | Scripts/notebooks/tests remain useful; `app/` duplicates extracted runtime domains. | Clarify role in docs. |
| `docs/microservices/` | Microservice architecture and contract docs. | KEEP / DONE | Canonical architecture, API, Compose, persistence, and service status docs synchronized in MS-13G. | Extraction files remain historical records plus current status addenda. |
| `docs/frontend/` | Frontend planning and task docs. | KEEP / NEEDS DECISION | Active task/design records are current; older IA/wireframe/reference files still contain superseded Reports/mock-first plans. | Preserve as history or schedule a dedicated archival annotation pass. |
| `docs/methodology/` | AHP/Fuzzy AHP methodology docs. | KEEP | Sample/final expert judgement boundaries are documented. | Keep. |

## 3. Prisma Audit

### Search Findings

| Evidence | Status | Notes |
| --- | --- | --- |
| `prisma/schema.prisma` | Removed in MS-13E | Legacy SQLite Prisma schema was deleted after no active runtime dependency was found. |
| `prisma/migrations/20260513121528_init/migration.sql` | Removed in MS-13E | Legacy Prisma migration was deleted with `prisma/`. |
| `prisma.config.ts` | Removed in MS-13E | Legacy Prisma config was deleted after package/code audit found no Prisma tooling dependency. |
| `frontend/package.json` | No active Prisma dependency | No `prisma` or `@prisma/client` dependency found in frontend package file. |
| Runtime services | No active Prisma client usage found | Search did not find `PrismaClient` in `frontend/` or `services/`. |
| `services/api-gateway/app/repositories/inference_history_repository.py` | Active non-Prisma persistence | Implements SQLite/PostgreSQL persistence directly through Python repository code. |
| `.env.example` | Current API Gateway env | `DATABASE_URL` is documented as local/demo API Gateway repository fallback; `API_GATEWAY_DATABASE_URL` remains the Docker/deployment PostgreSQL path. |
| `CLAUDE.md` | Updated in MS-13E | Prisma commands, project-tree entries, and feature checklist wording were removed or replaced with API Gateway repository persistence guidance. |

### Answers

| Question | Answer |
| --- | --- |
| Is Prisma actively used by runtime services? | No active runtime usage was found. Runtime inference persistence is implemented in `api-gateway` with repository-based SQLite/PostgreSQL support. |
| Is Prisma only legacy? | Yes. It was legacy schema/tooling and planning history, not the active persistence implementation. |
| Is Prisma mentioned in documentation as if active? | MS-13E updated the primary architecture/persistence docs and `CLAUDE.md` so remaining Prisma references should be historical/removal notes only. |
| Is there risk in removing `prisma/` now? | Low after MS-13E audit. Active persistence uses API Gateway repository code; database env variables remain. |
| Recommended decision | REMOVE LATER / DONE. `prisma/` and `prisma.config.ts` were removed in MS-13E. |

## 4. Report-service Audit

### Runtime Dependency Findings

| Evidence | Status | Notes |
| --- | --- | --- |
| `services/api-gateway/app/main.py` | Active | Includes `report.router`. |
| `services/api-gateway/app/routers/report.py` | Active | Proxies `/reports/summary`, `/evaluation/summary`, and `/reports/ranking-comparison` to `report-service`. |
| `services/api-gateway/app/core/config.py` | Active | Defines `report_service_url` from `REPORT_SERVICE_URL`. |
| `services/api-gateway/app/routers/health.py` | Active | Includes `report-service` in service health aggregation. |
| `docker-compose.yml` | Active | Builds and starts `report-service`; API Gateway depends on it. |
| `frontend/services/report-service.ts` | Active | `getRankingComparison()` is used by Dashboard and AHP/Fuzzy AHP; `getReportSummary()` was removed in MS-13C. |
| `frontend/services/evaluation-service.ts` | Active | Calls `/evaluation/summary`, which the API Gateway forwards to `report-service`. |
| `frontend/services/dashboard-service.ts` | Active | Uses `getRankingComparison()` from `report-service.ts` for Dashboard data. |
| `frontend/services/ahp-overview-service.ts` | Active | Uses `getRankingComparison()` for AHP/Fuzzy AHP read-only results. |
| `frontend/app/reports/page.tsx` | Removed | Deleted in MS-13C after the route only redirected to `/dashboard`. |

### Answers

| Question | Answer |
| --- | --- |
| Is `report-service` still called by API Gateway? | Yes. API Gateway proxies three report/evaluation routes to it. |
| Is `report-service` still called by frontend through API Gateway? | Yes. Frontend calls `/evaluation/summary` and `/reports/ranking-comparison`; both are backed by `report-service`. |
| Does Dashboard depend on `/reports/summary`? | No direct dependency found. Dashboard depends on `/reports/ranking-comparison` and `/evaluation/summary`, not `/reports/summary`. |
| Is frontend `/reports` route still present? | No. The route file was removed in MS-13C. |
| Is the Reports menu removed from navigation? | Yes. `frontend/constants/navigation.ts` has no Reports item. |
| Does `report-service` only duplicate dashboard summary? | No. It overlaps with dashboard/report aggregation, but it also supplies active evaluation and ranking comparison data used by Dashboard, Model Evaluation, and AHP/Fuzzy AHP. |
| If removed, what must change? | API Gateway report router/config/health/tests, Docker Compose service and dependency, frontend endpoint ownership for `/evaluation/summary` and `/reports/ranking-comparison`, frontend `report-service.ts` imports, types/empty defaults for report summary if unused, and microservice docs/API contract. |
| Recommended decision | KEEP. MS-13D confirmed `report-service` is still needed as Dashboard/evaluation/ranking aggregation; deprecate only after replacing or relocating active routes. |

### Removal Impact Map

| File or area | Required future change if removing `report-service` |
| --- | --- |
| `services/api-gateway/app/routers/report.py` | Remove or reroute report/evaluation endpoints. |
| `services/api-gateway/app/main.py` | Remove report router registration if no replacement route remains. |
| `services/api-gateway/app/core/config.py` | Remove `report_service_url` only after no routes use it. |
| `services/api-gateway/app/routers/health.py` | Remove `report-service` from service health aggregation. |
| `services/api-gateway/tests/test_report_gateway.py` | Remove or rewrite tests for new endpoint ownership. |
| `services/report-service/` | Remove only after endpoint migration and docs update. |
| `docker-compose.yml` | Remove `report-service`, `REPORT_SERVICE_URL`, and API Gateway dependency only after migration. |
| `frontend/lib/api-endpoints.ts` | Remove `/reports/summary` if unused; keep or relocate ranking comparison endpoint. |
| `frontend/services/report-service.ts` | `getReportSummary()` was removed in MS-13C; move `getRankingComparison()` only if endpoint ownership changes. |
| `frontend/services/dashboard-service.ts` | Update import/source if ranking comparison moves. |
| `frontend/services/ahp-overview-service.ts` | Update import/source if ranking comparison moves. |
| `frontend/services/evaluation-service.ts` | Update endpoint owner if evaluation summary moves. |
| `docs/microservices/api-contract.md` | Update ownership table and report endpoint docs. |
| `docs/microservices/report-service-extraction.md` | Keep current and clarify MS-13D decision. Mark deprecated only after endpoint migration. |

## 5. Frontend Reports Audit

### Findings

| Item | Status | Notes |
| --- | --- | --- |
| `/reports` route | Removed | `frontend/app/reports/page.tsx` was deleted in MS-13C. |
| Navigation reachability | Not reachable from nav | `NAVIGATION_ITEMS` does not include Reports. |
| Route constant | Removed | `APP_ROUTES.reports` was removed in MS-13C. |
| API endpoint constants | Present for active ranking | `/reports/ranking-comparison` remains; the frontend `/reports/summary` constant was removed in MS-13C. |
| Report adapter | Present for active ranking | `getRankingComparison()` exists; `getReportSummary()` was removed in MS-13C. |
| Dashboard duplication | Partial | `/reports` UI is gone; Dashboard contains summary/recommendation content. |
| Print/export report button | Not found in active frontend code | Search found no `Cetak Laporan`, `window.print`, or report export action in active app/components. |
| "Laporan" label | Present outside Reports page | `frontend/app/model-evaluation/page.tsx` uses `Laporan Klasifikasi / Ringkasan Evaluasi`, which is evaluation terminology, not a Reports route. |
| Legacy mock report data | Present | `frontend/lib/mock-data.ts` still contains report mock/reference data. Not active fallback based on inspected service flow. |

### Answers

| Question | Answer |
| --- | --- |
| Does `/reports` still exist? | No frontend route file remains after MS-13C. |
| Is it reachable from navigation? | No. |
| Is it duplicated with Dashboard? | Functionally yes: report-style summary content has been folded into Dashboard/AHP/Evaluation flows. The actual `/reports` page no longer renders report UI. |
| Can it be safely removed in a future milestone? | Already removed in MS-13C. Remaining work is documentation sync for historical frontend docs. |
| What files would be affected? | Future cleanup is limited to stale docs/mock references such as frontend IA/wireframes/design references and inactive mock metadata. Active Dashboard/AHP/Evaluation adapters must remain. |

Recommended decision: DONE for the frontend redirect route and unused `getReportSummary()` cleanup; KEEP active ranking/evaluation gateway adapters until endpoint ownership is changed.

## 6. Docker Audit

### Active Docker Services

| Compose service | Image/container | Port | MS-13F status | Notes |
| --- | --- | ---: | --- | --- |
| `api-gateway-service` | `sentirank-api-gateway-service` | 8000 | Required for local backend demo | Public API boundary; depends on active backend domain services. Uses SQLite by default unless `API_GATEWAY_DATABASE_URL` points elsewhere. |
| `review-service` | `sentirank-review-service` | 8001 | Required for local backend demo | Mounted `datasets/` and `docs/` read-only. |
| `sentiment-service` | `sentirank-sentiment-service` | 8002 | Required for local backend demo | Mounted `datasets/`, `docs/`, and `ml-service/saved_models/indobert` read-only. |
| `aspect-service` | `sentirank-aspect-service` | 8003 | Required for local backend demo | Mounted `datasets/`, `docs/`, and `ml-service/saved_models/svm` read-only. |
| `decision-service` | `sentirank-decision-service` | 8004 | Required for local backend demo | Calculation service. |
| `report-service` | `sentirank-report-service` | 8005 | Required for current backend demo | API Gateway depends on it and active frontend flows use routes backed by it. |
| `frontend-service` | `sentirank-frontend-service` | 3000 | Optional profile `frontend` | Next.js dev container; local `npm run dev` and future Vercel frontend remain valid. |
| `database-service` | `postgres:16-alpine` / `sentirank-database-service` | 5432 | Optional profile `postgres` | Use for deployment-like PostgreSQL mode after setting `API_GATEWAY_DATABASE_URL` to `database-service`. |

### Docker Answers

| Question | Answer |
| --- | --- |
| Optional/possibly removable services | `frontend-service` is optional for Dockerized frontend demos. `database-service` is optional for PostgreSQL mode. `report-service` is not removable yet because active routes still depend on it. |
| Is `report-service` required? | Yes for current backend/API Gateway routing. Not required by the removed `/reports` frontend page specifically. |
| Is PostgreSQL required or optional? | Optional as of MS-13F. Local/demo Compose defaults to SQLite; PostgreSQL remains available through the `postgres` profile and explicit `API_GATEWAY_DATABASE_URL`. |
| Is SQLite local/demo default documented? | Yes, in `docs/microservices/runtime-inference-persistence.md`, `docs/microservices/docker-compose-foundation.md`, `.env.example`, and API Gateway code defaults. |
| Are model artifacts mounted read-only? | Yes. IndoBERT and SVM saved model folders are mounted with `:ro`. |
| Is Docker Compose too broad for current demo? | Reduced in MS-13F. Default Compose now starts the backend demo only; frontend and PostgreSQL are opt-in profiles. |
| Healthchecks | MS-13F added Compose-level lightweight `/health` checks for backend services and `pg_isready` for optional PostgreSQL. |

### Recommended Docker Cleanup Plan

| Step | Classification | Action |
| --- | --- | --- |
| Inventory dependencies before removal | DONE | MS-13F kept all active backend services and changed only default/profile behavior. |
| Add optional profiles | DONE | Added `frontend` and `postgres` profiles. Backend services remain default for `docker compose up --build`. |
| Keep model mounts read-only | KEEP | Preserve `:ro` mounts for datasets/docs/model artifacts. |
| Decide PostgreSQL demo policy | DONE | SQLite is local/demo default; PostgreSQL is optional deployment-like mode. |
| Remove deprecated services later | REMOVE LATER | Do not remove `report-service` from Compose after MS-13D; remove only after a future endpoint ownership migration. |

## 7. Generated Files / Cache Audit

### Existing Generated/Cache Artifacts

| Artifact | Exists now | Git status | `.gitignore` coverage | Classification | Notes |
| --- | --- | --- | --- | --- | --- |
| Root `.pytest_cache/` | Yes | Untracked; access warnings during status/listing | Not explicitly covered | CLEAN GENERATED | Add `.pytest_cache/`. |
| `services/*/.pytest_cache/` | Yes for all inspected services | Untracked; access warnings during status/listing | Not explicitly covered | CLEAN GENERATED | Add `services/*/.pytest_cache/` or `**/.pytest_cache/`. |
| `ml-service/.pytest_cache/` | Yes | Ignored | Covered by `ml-service/.pytest_cache/` | CLEAN GENERATED | Clean in MS-13B. |
| `__pycache__/` under services and `ml-service` source/tests/scripts | Yes | Not tracked | `.pyc` covered; service dirs not explicitly covered | CLEAN GENERATED | Add `**/__pycache__/` for clarity. |
| `*.pyc` | Yes | Not tracked | Covered by `*.pyc` | CLEAN GENERATED | 152 non-venv/source-side `.pyc` paths were found by targeted search. |
| `.pytest_tmp/` | No | Not applicable | Not covered | TODO | Add ignore before future test runs create it. |
| `dev.db` | Yes | Ignored | Covered by `*.db` | CLEAN GENERATED | Legacy/local SQLite database file. Do not delete until owner confirms no local data is needed. |
| `runtime_inference_history.db` | No | Not applicable | Covered by `*.db`; specific name not covered | TODO | Add explicit ignore for readability. |
| `frontend/node_modules/` | Yes | Ignored | Covered by `node_modules/` | CLEAN GENERATED | Do not commit. |
| `frontend/.next/` | Yes | Ignored | Covered by `.next/` | CLEAN GENERATED | Do not commit. |
| `build/`, `dist/`, `coverage/` | Not confirmed in inspected root paths | Not applicable | Not covered except `.next/` | TODO | Add generic ignore entries if future tooling creates them. |
| `model.safetensors` under `ml-service/saved_models/indobert/...` | Yes | Ignored; not tracked | Covered | KEEP | Binary was not opened or inspected. |
| SVM `*.joblib` under `ml-service/saved_models/svm/` | Yes | Ignored; not tracked | Covered by `ml-service/saved_models/**/*` | KEEP | Binary was not opened or inspected. |

`git ls-files` returned no tracked cache files, local DB files, or model binaries for the checked patterns.

### Suggested `.gitignore` Additions for MS-13B

```gitignore
.pytest_cache/
**/.pytest_cache/
**/__pycache__/
.pytest_tmp/
runtime_inference_history.db
coverage/
dist/
build/
```

Keep existing model-artifact ignore rules. Do not add rules that would hide source files or documentation.

## 8. ml-service Role Audit

### Classification

| `ml-service` area | Classification | Current role | Notes |
| --- | --- | --- | --- |
| `ml-service/scripts/` | KEEP | Active reproducible research pipeline scripts for scraping, labeling, preprocessing, training, evaluation, AHP/Fuzzy AHP, ranking comparison, expert judgement validation, and artifact validation. | Keep as research pipeline. |
| `ml-service/notebooks/` | KEEP | Research notebooks for data acquisition, preprocessing, IndoBERT, SVM, evaluation, AHP, Fuzzy AHP, and ranking comparison. | Keep for thesis evidence. |
| `ml-service/quality_audit/` | KEEP | Quality audit outputs and figures for preprocessing/data quality. | Keep as research evidence unless separately regenerated. |
| `ml-service/models/` | KEEP | Model definition/source placeholders, not trained weights. | Keep. |
| `ml-service/saved_models/` | KEEP | Local trained model artifacts used by services through read-only mounts. Ignored by Git except `.gitkeep`. | Do not modify in hygiene cleanup. |
| `ml-service/tests/` | KEEP | Tests for preprocessing, AHP/Fuzzy AHP, response helpers, and text utilities. | Keep. |
| `ml-service/app/` | DEPRECATE | Legacy modular FastAPI runtime boundary. | Overlaps extracted services and should no longer be described as frontend-facing runtime. |
| `ml-service/.venv/`, `.pytest_cache/`, `__pycache__/` | CLEAN GENERATED | Local environment and test/runtime caches. | Clean in MS-13B where safe. |
| `ml-service/.env` | KEEP LOCAL / CLEAN GENERATED policy | Local env file, ignored. | Do not read or print secrets. |

### Answers

| Question | Answer |
| --- | --- |
| Which parts are still active research pipeline? | `scripts/`, `notebooks/`, `quality_audit/`, selected `models/` source, tests, and saved model artifacts as local model outputs. |
| Which parts are legacy runtime from pre-microservice architecture? | `ml-service/app/` and its routers/services/schemas for sentiment, aspects, evaluation, AHP, Fuzzy AHP, ranking, and preprocessing. |
| Does `ml-service/app` duplicate extracted services? | Yes. It overlaps `decision-service` for AHP/Fuzzy AHP, `sentiment-service` for sentiment, `aspect-service` for aspects, and parts of review/report/evaluation flows. |
| Should it be kept as research pipeline only? | Yes. Keep `ml-service` as research/experiment/export support; treat `ml-service/app` as legacy transition code until explicitly removed. |
| What docs should clarify this? | `CLAUDE.md`, `README.md`, `docs/microservices/architecture.md`, `docs/microservices/docker-compose-foundation.md`, and `docs/microservices/README.md`. |

## 9. Documentation Drift Audit

| File | MS-13G result | Residual status |
| --- | --- | --- |
| `README.md` | Added current architecture, local run commands, deployment modes, repository roles, model artifacts, and database policy. | Resolved. |
| `CLAUDE.md` | Added active repository roles and feature status; labeled the old planned tree as historical; corrected SQLite, Prisma, model, and test guidance. | Resolved for active guidance. |
| `docs/microservices/architecture.md` | Replaced modular-monolith/target framing with the active extracted runtime and corrected API Gateway persistence ownership. | Resolved. |
| `docs/microservices/api-contract.md` | Marked calculation POST routes as backend/manual interfaces and the frontend AHP/Fuzzy AHP page as read-only. | Resolved. |
| `docs/microservices/docker-compose-foundation.md` | Reframed MS-03 skeleton text as history and documented current service capabilities. | Resolved. |
| `frontend/README.md`, `frontend/DESIGN.md`, active frontend task/decision records | Aligned with gateway-only data, removed Reports scope, and current read-only AHP/Fuzzy AHP behavior. | Resolved for active frontend guidance. |
| Older frontend IA, wireframe, design-reference, component-map, API-integration, and API Gateway implementation plans | These historical documents still contain superseded Reports/mock-first/sample-panel plans and were outside the MS-13G edit list. | NEEDS DECISION: annotate as historical or archive in a separately scoped documentation pass. |

MS-13A created this audit; MS-13G synchronized the canonical active documentation while preserving explicitly historical milestone records.

## 10. Recommended Cleanup Roadmap

| Milestone | Classification | Scope | Must not do |
| --- | --- | --- | --- |
| MS-13B | CLEAN GENERATED | Remove `.pytest_cache/`, `services/*/.pytest_cache/`, `__pycache__/`, `.pyc`, `.pytest_tmp/` if present, and local runtime DB files only after confirming no local data is needed. Update `.gitignore` first. | No runtime logic changes. No model artifact changes. |
| MS-13C | DONE | Cleaned frontend Reports leftovers: redirect route, route constants, and unused `getReportSummary()`. Preserved Dashboard, AHP/Fuzzy AHP, and Model Evaluation behavior. | Do not remove `getRankingComparison()` until endpoint ownership is changed. |
| MS-13D | KEEP | Decided report-service future. Active `/evaluation/summary` and `/reports/ranking-comparison` remain backed by `report-service`, so it stays in runtime topology. | Do not delete service just because Reports menu is gone. |
| MS-13E | REMOVE LATER / DONE | Removed unused legacy Prisma setup after final reference audit confirmed no active runtime dependency. | Keep API Gateway repository persistence, SQLite local/demo default, and PostgreSQL deployment support. |
| MS-13F | DONE | Docker cleanup for local/demo runtime. Backend services now run by default with SQLite; frontend and PostgreSQL are optional profiles; report-service remains active. | Do not remove services until endpoint ownership changes. |
| MS-13G | DONE | Synchronized canonical README, CLAUDE, architecture, API, Compose, persistence, service, ML, and active frontend documentation. | Historical planning files outside the edit scope remain explicitly tracked for a later annotation/archive decision. |

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Removing `report-service` breaks Dashboard/AHP/Evaluation data. | High | High | Move or replace `/evaluation/summary` and `/reports/ranking-comparison` first. |
| Future docs imply Prisma still exists after MS-13E removal. | Medium | Medium | Keep remaining Prisma references limited to historical/removal notes; verify with search before future database milestones. |
| Cleaning `dev.db` or future runtime DB deletes local test/demo history. | Medium | Medium | Confirm owner does not need local records before deletion. |
| Cleaning generated files before `.gitignore` update recreates noisy untracked files. | High | Low | Update ignore rules first in MS-13B. |
| Broad Docker cleanup makes thesis demo harder to run. | Medium | High | MS-13F added only `frontend` and `postgres` profiles; backend service topology remains intact. |
| Treating `ml-service/app` as active runtime creates architecture confusion. | High | Medium | Document it as legacy transition code and keep frontend on API Gateway. |
| Older frontend planning docs continue to reference Reports after route cleanup. | Medium | Medium | Active guidance is corrected; annotate or archive older IA/wireframe/component-map records in a separately scoped documentation pass. |
| Model binaries accidentally inspected or staged. | Low if rules followed | High | Keep `saved_models` ignored; do not open binary contents; do not stage them. |

## 12. Proposed MS-13B / MS-13C / MS-13D Sequence

### MS-13B: Generated/cache cleanup

Classification: CLEAN GENERATED

Tasks:

| Task | Notes |
| --- | --- |
| Update `.gitignore` | Add root/service pytest cache, `**/__pycache__/`, `.pytest_tmp/`, explicit runtime DB, and generic build output rules. |
| Remove `.pytest_cache/` | Include root and service caches. |
| Remove `__pycache__/` and `*.pyc` | Exclude `.venv`, `node_modules`, `.next`, and `saved_models`. |
| Review local DB files | `dev.db` exists and is ignored. Confirm before deletion. |
| Verify | Run `git status --short` and ensure only intended ignore/doc changes remain. |

### MS-13C: Frontend reports cleanup

Classification: DONE

Tasks:

| Task | Notes |
| --- | --- |
| Remove `/reports` redirect | Done in MS-13C. |
| Remove stale route constants | Done in MS-13C after confirming no imports remained. |
| Remove unused report summary adapter | Done in MS-13C. `getRankingComparison()` is active and must stay or be relocated only after endpoint ownership changes. |
| Remove report print/export leftovers if found | No active print/export button was found in current app code. |
| Preserve Dashboard behavior | Dashboard depends on ranking comparison and evaluation summary. |

### MS-13D: Report-service deprecation/removal decision

Classification: KEEP

Decision rules:

| Condition | Decision |
| --- | --- |
| Dashboard/AHP/Evaluation still use routes backed by `report-service` | KEEP |
| `/reports/summary` is unused but `/evaluation/summary` and `/reports/ranking-comparison` remain active | DEPRECATE only the unused report-summary surface, not the whole service |
| All active routes are moved to other service owners and tests/docs/Compose are updated | REMOVE LATER |

MS-13D result: KEEP `report-service` as Dashboard/evaluation/ranking aggregation. The frontend Reports page/menu and print/export feature remain out of scope; backend removal is deferred until active routes have replacement owners.

### MS-13E: Prisma legacy removal

Classification: REMOVE LATER / DONE

Tasks:

| Task | Notes |
| --- | --- |
| Confirm no `PrismaClient` usage | Done in MS-13E; no active runtime/package dependency found. |
| Update docs/env | Done in MS-13E; `DATABASE_URL` fallback belongs to API Gateway repository mode, not Prisma. |
| Preserve persistence support | Done in MS-13E; SQLite local/demo default and PostgreSQL deployment support remain. |
| Remove legacy files | Done in MS-13E; deleted `prisma/` and `prisma.config.ts`. |

### MS-13F: Docker cleanup

Classification: DONE

Tasks:

| Task | Notes |
| --- | --- |
| Add optional Compose profiles if useful | Done. Added `frontend` and `postgres`; backend services remain the default local/demo stack. |
| Keep read-only artifact mounts | Done. Preserved `:ro` for datasets/docs/model artifacts. |
| Remove deprecated services only after audit | Done. No service was removed; `report-service` remains active because route ownership remains there. |
| Document SQLite local/demo default | Done. Compose, `.env.example`, and Docker docs now document SQLite local/demo default and PostgreSQL optional mode. |

### MS-13G: Documentation sync

Classification: DONE

Tasks:

| File group | Result |
| --- | --- |
| `README.md` | Added current architecture, run guide, deployment modes, repository roles, model artifact policy, and database policy. |
| `CLAUDE.md` | Added active role map/current feature status and labeled old structure details as historical. |
| `docs/microservices/architecture.md` | Rewritten to describe the extracted active runtime and API Gateway persistence ownership. |
| `docs/microservices/api-contract.md` | Calculation endpoints are backend/manual interfaces; the current frontend page is read-only. |
| Active frontend docs | Task tracker, decision log, frontend README, and design specification aligned with current scope. |
| Historical frontend plans | Not edited outside the approved file list; retained as a documented follow-up decision. |
