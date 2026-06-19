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
| `docs/` | KEEP | Thesis/project documentation. Some files are stale. | Keep; sync in MS-13G. |
| `prisma/`, `prisma.config.ts` | DEPRECATE | Prisma schema/migration artifacts exist, but runtime persistence is implemented in `api-gateway` via repository SQL support. | Deprecate first; remove later only after docs and env references are cleaned. |
| Generated caches and local DB files | CLEAN GENERATED | `.pytest_cache/`, service `.pytest_cache/`, `__pycache__/`, `.pyc`, `frontend/node_modules/`, `frontend/.next/`, and `dev.db` exist. | Clean in MS-13B; update `.gitignore` first where missing. |

The most important constraint is that `report-service` is not safe to remove immediately. The Reports frontend menu/page has been removed, but the service still supplies active gateway routes used by Dashboard, AHP/Fuzzy AHP, and Model Evaluation.

## 2. Current Project Role Map

| Path | Current role | Classification | Evidence | Notes |
| --- | --- | --- | --- | --- |
| `README.md` | Short current project overview and data-source policy. | KEEP | Mentions API Gateway-only frontend access and runtime inference database boundary. | Mostly current. |
| `CLAUDE.md` | Agent/project rules and architecture context. | KEEP / TODO | Contains current microservice policy, but also legacy Prisma commands and old feature checklist. | Sync in MS-13G. |
| `AGENTS.md` | Agent instructions and frontend tracking rules. | KEEP | Defines frontend task tracker expectations. | No change in MS-13A. |
| `docker-compose.yml` | Current multi-service development stack. | KEEP / TODO | Defines frontend, API Gateway, six domain/runtime services, and PostgreSQL. | Cleanup/profiles should wait for MS-13F. |
| `.gitignore` | Git hygiene rules. | TODO | Covers many artifacts but misses root/service pytest cache and some generic generated dirs. | Update in MS-13B before cleanup. |
| `.env.example` | Environment template. | KEEP / TODO | Includes legacy `DATABASE_URL` and active `API_GATEWAY_DATABASE_URL`. | Clarify Prisma vs API Gateway database use in MS-13G. |
| `prisma/` | Legacy Prisma schema and SQLite migration. | DEPRECATE | No active runtime Prisma client usage found. | Keep until MS-13E decision. |
| `services/` | Active runtime microservices. | KEEP | Docker builds and API Gateway routes target these services. | Keep service boundaries. |
| `frontend/app/reports/` | Removed frontend Reports route. | REMOVE LATER / DONE | Removed in MS-13C after it only redirected to `/dashboard`. | Backend report-service remains separate from this page removal. |
| `frontend/services/report-service.ts` | Frontend adapter for ranking endpoints through API Gateway. | KEEP | `getRankingComparison()` is actively used by Dashboard and AHP/Fuzzy AHP; `getReportSummary()` was removed in MS-13C. | Keep until endpoint ownership changes. |
| `ml-service/` | Research pipeline plus legacy runtime. | KEEP / DEPRECATE | Scripts/notebooks/tests remain useful; `app/` duplicates extracted runtime domains. | Clarify role in docs. |
| `docs/microservices/` | Microservice architecture and contract docs. | KEEP / TODO | Mostly current but some stale statements remain. | Sync in MS-13G. |
| `docs/frontend/` | Frontend planning and task docs. | KEEP / TODO | Older IA/wireframes still describe Reports page and mock-first behavior. | Sync in MS-13G. |
| `docs/methodology/` | AHP/Fuzzy AHP methodology docs. | KEEP | Sample/final expert judgement boundaries are documented. | Keep. |

## 3. Prisma Audit

### Search Findings

| Evidence | Status | Notes |
| --- | --- | --- |
| `prisma/schema.prisma` | Legacy schema present | Uses `provider = "sqlite"` and includes review, evaluation, ranking, and `InferenceHistory` models. |
| `prisma/migrations/20260513121528_init/migration.sql` | Legacy migration present | SQLite-style migration file exists. |
| `prisma.config.ts` | Legacy Prisma config present | Points to `prisma/schema.prisma` and reads `DATABASE_URL`. |
| `frontend/package.json` | No active Prisma dependency | No `prisma` or `@prisma/client` dependency found in frontend package file. |
| Runtime services | No active Prisma client usage found | Search did not find `PrismaClient` in `frontend/` or `services/`. |
| `services/api-gateway/app/repositories/inference_history_repository.py` | Active non-Prisma persistence | Implements SQLite/PostgreSQL persistence directly through Python repository code. |
| `.env.example` | Mixed legacy/current env | `DATABASE_URL="file:./dev.db"` remains, while active Docker persistence uses `API_GATEWAY_DATABASE_URL`. |
| `CLAUDE.md` | Documentation drift | Still lists Prisma migration commands and Prisma schema work in command/feature sections. |

### Answers

| Question | Answer |
| --- | --- |
| Is Prisma actively used by runtime services? | No active runtime usage was found. Runtime inference persistence is implemented in `api-gateway` with repository-based SQLite/PostgreSQL support. |
| Is Prisma only legacy? | Yes, based on current inspected code. It is legacy schema/tooling and planning history, not the active persistence implementation. |
| Is Prisma mentioned in documentation as if active? | Partially. `CLAUDE.md` still lists Prisma commands and old feature checklist items; `docs/microservices/architecture.md` correctly says Prisma/SQLite artifacts remain and should not drive artifact migration. |
| Is there risk in removing `prisma/` now? | Yes. Removing it now would delete schema history while docs/env still reference `DATABASE_URL` and Prisma commands. It could also confuse future database work if no replacement migration policy is documented. |
| Recommended decision | DEPRECATE now; REMOVE LATER only after MS-13E verifies no code, docs, commands, or env templates still depend on it. |

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

| Compose service | Image/container | Port | Required now? | Notes |
| --- | --- | ---: | --- | --- |
| `frontend-service` | `sentirank-frontend-service` | 3000 | Yes | Next.js dev container. |
| `api-gateway-service` | `sentirank-api-gateway-service` | 8000 | Yes | Public API boundary; depends on all backend services and database. |
| `review-service` | `sentirank-review-service` | 8001 | Yes | Mounted `datasets/` and `docs/` read-only. |
| `sentiment-service` | `sentirank-sentiment-service` | 8002 | Yes | Mounted `datasets/`, `docs/`, and `ml-service/saved_models/indobert` read-only. |
| `aspect-service` | `sentirank-aspect-service` | 8003 | Yes | Mounted `datasets/`, `docs/`, and `ml-service/saved_models/svm` read-only. |
| `decision-service` | `sentirank-decision-service` | 8004 | Yes | Calculation service. |
| `report-service` | `sentirank-report-service` | 8005 | Yes for current Compose | API Gateway depends on it and active frontend flows use routes backed by it. |
| `database-service` | `postgres:16-alpine` / `sentirank-database-service` | 5432 | Required in current Compose | API Gateway is configured with PostgreSQL URL in Compose. Optional outside Compose because repository supports SQLite fallback. |

### Docker Answers

| Question | Answer |
| --- | --- |
| Optional/possibly removable services | `report-service` is the main candidate, but not removable yet. `database-service` is optional only outside Docker/local test mode; current Compose requires it. |
| Is `report-service` required? | Required by current Compose and current API Gateway routing. Not required by the removed `/reports` frontend page specifically. |
| Is PostgreSQL required or optional? | Required for the current Docker Compose path because `API_GATEWAY_DATABASE_URL` points to `database-service` and API Gateway depends on it. Optional for local tests/dev because API Gateway code supports SQLite URLs. |
| Is SQLite fallback documented? | Yes, in `docs/microservices/runtime-inference-persistence.md` and API Gateway code defaults. |
| Are model artifacts mounted read-only? | Yes. IndoBERT and SVM saved model folders are mounted with `:ro`. |
| Is Docker Compose too broad for current demo? | For the full microservice demo, no. For narrower frontend-only or docs-only demos, yes: no optional profiles exist, so Compose always builds the whole stack. |
| Healthchecks | Services expose `/health`, but `docker-compose.yml` does not define Compose-level `healthcheck` blocks. |

### Recommended Docker Cleanup Plan

| Step | Classification | Action |
| --- | --- | --- |
| Inventory dependencies before removal | TODO | Keep current Compose until route/service ownership is resolved. |
| Add optional profiles | NEEDS DECISION | Consider profiles such as `core`, `reports`, `db`, or `full` if demo startup is too heavy. |
| Keep model mounts read-only | KEEP | Preserve `:ro` mounts for datasets/docs/model artifacts. |
| Decide PostgreSQL demo policy | NEEDS DECISION | Keep PostgreSQL for full runtime inference demo; document SQLite local fallback separately. |
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
| `dev.db` | Yes | Ignored | Covered by `*.db` | CLEAN GENERATED | Local SQLite/Prisma-era database file. Do not delete until owner confirms no local data is needed. |
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

| File | Drift topic | Priority | Suggested future update |
| --- | --- | --- | --- |
| `CLAUDE.md` | Still lists Prisma migration commands, old feature checklist items, and old project tree entries such as `app/api`, `lib/prisma`, and `ml-service/app` as "FastAPI runtime (ML inference API)". | High | Sync command section, project tree, feature checklist, and ml-service role with current microservice state. |
| `docs/microservices/architecture.md` | Opening assessment says most backend/ML domains still live inside `ml-service`, while later sections correctly state services are extracted and runtime inference is active. | High | Rewrite "Current Architecture Assessment" to distinguish historical transition from current active services. |
| `docs/microservices/api-contract.md` | Service ownership table still marks `/ahp/calculate`, `/ahp/fuzzy-calculate`, and `/ahp/compare` as AHP/Fuzzy AHP page consumers; frontend rules still say page may run sample calculations through `/ahp/*`. Current page is read-only. | High | Mark calculation endpoints as backend/manual/future workflow, not main-page frontend triggers. |
| `docs/frontend/information-architecture.md` | Primary nav and route plan still include Reports as a full page. | High | Remove Reports as active nav page or mark it as historical/redirect. |
| `docs/frontend/wireframes.md` | Dashboard and model pages still link/open Reports, and a full Reports wireframe remains. | High | Mark Reports wireframe as superseded by Dashboard or archive it. |
| `docs/frontend/design-references.md` | Reports page references and export layout remain as active design guidance. | Medium | Mark Reports references as historical or future-only. |
| `docs/frontend/component-map.md` | Component usage still includes Reports across many components; topbar mentions export/run mock/open report. | Medium | Update usage matrix to current reachable pages and remove mock-run language where superseded. |
| `frontend/DESIGN.md` | MS-13C removed Reports from the active sidebar/page inventory. | Low | Keep aligned if a future Reports feature is intentionally reintroduced. |
| `docs/frontend/api-integration-plan.md` | Historical sections still mention Report page fallback and service `getReportSummary()`. | Medium | Mark as historical or add current status that frontend `/reports` was removed and report summary is unused by active pages. |
| `docs/microservices/docker-compose-foundation.md` | Purpose/skeleton sections still describe MS-03 scaffolding and minimal services, while the same doc later includes current extracted services. | Low | Add "historical foundation" note or split current Compose reference from MS-03 history. |
| `docs/microservices/report-service-extraction.md` | MS-13D now clarifies `report-service` as active aggregation infrastructure, not a printable Reports page. | Low | Keep aligned if a future endpoint ownership migration removes the service. |

No documentation was updated in MS-13A except this audit report.

## 10. Recommended Cleanup Roadmap

| Milestone | Classification | Scope | Must not do |
| --- | --- | --- | --- |
| MS-13B | CLEAN GENERATED | Remove `.pytest_cache/`, `services/*/.pytest_cache/`, `__pycache__/`, `.pyc`, `.pytest_tmp/` if present, and local runtime DB files only after confirming no local data is needed. Update `.gitignore` first. | No runtime logic changes. No model artifact changes. |
| MS-13C | DONE | Cleaned frontend Reports leftovers: redirect route, route constants, and unused `getReportSummary()`. Preserved Dashboard, AHP/Fuzzy AHP, and Model Evaluation behavior. | Do not remove `getRankingComparison()` until endpoint ownership is changed. |
| MS-13D | KEEP | Decided report-service future. Active `/evaluation/summary` and `/reports/ranking-comparison` remain backed by `report-service`, so it stays in runtime topology. | Do not delete service just because Reports menu is gone. |
| MS-13E | DEPRECATE / REMOVE LATER | Decide Prisma future. Deprecate first if unused; remove later after docs/env/commands are stable and persistence migration policy is clear. | Do not delete schema history before documentation is aligned. |
| MS-13F | TODO | Docker cleanup. Add profiles if needed, remove deprecated services only after dependency audit, document PostgreSQL vs SQLite local mode. | Do not edit Compose before service decisions. |
| MS-13G | TODO | Documentation sync across README, CLAUDE, architecture docs, API contract, frontend IA/wireframes/design docs, and microservice docs. | Do not rewrite historical docs without marking what is historical vs current. |

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Removing `report-service` breaks Dashboard/AHP/Evaluation data. | High | High | Move or replace `/evaluation/summary` and `/reports/ranking-comparison` first. |
| Removing Prisma too early loses database schema history and confuses docs/env commands. | Medium | Medium | Deprecate first, then remove after MS-13E documentation and persistence decision. |
| Cleaning `dev.db` or future runtime DB deletes local test/demo history. | Medium | Medium | Confirm owner does not need local records before deletion. |
| Cleaning generated files before `.gitignore` update recreates noisy untracked files. | High | Low | Update ignore rules first in MS-13B. |
| Broad Docker cleanup makes thesis demo harder to run. | Medium | High | Add profiles only after identifying minimal demo paths. |
| Treating `ml-service/app` as active runtime creates architecture confusion. | High | Medium | Document it as legacy transition code and keep frontend on API Gateway. |
| Docs continue to reference Reports page after route cleanup. | High | Medium | MS-13G should sync frontend IA, wireframes, component map, and design docs. |
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

### MS-13E: Prisma deprecation/removal decision

Classification: DEPRECATE / REMOVE LATER

Tasks:

| Task | Notes |
| --- | --- |
| Confirm no `PrismaClient` usage | Current audit found none. Re-check before deletion. |
| Update docs/env | Clarify `DATABASE_URL` fallback belongs to API Gateway repository mode, not active Prisma. |
| Decide migration policy | If future DB schema is raw SQL or Alembic-like, document that before deleting Prisma. |
| Remove later | Delete `prisma/` and `prisma.config.ts` only after docs and tooling are stable. |

### MS-13F: Docker cleanup

Classification: TODO

Tasks:

| Task | Notes |
| --- | --- |
| Add optional Compose profiles if useful | Example candidates: `core`, `reports`, `db`, `full`. |
| Keep read-only artifact mounts | Preserve `:ro` for datasets/docs/model artifacts. |
| Remove deprecated services only after audit | Do not remove `report-service`; MS-13D kept it because active route ownership remains there. |
| Document SQLite local fallback | Keep Docker PostgreSQL path separate from local/test SQLite fallback. |

### MS-13G: Documentation sync

Classification: TODO

Tasks:

| File group | Update |
| --- | --- |
| `README.md` | Keep short current architecture summary. Add pointer to hygiene decisions if needed. |
| `CLAUDE.md` | Remove stale Prisma command implication, old feature checklist, and ambiguous project tree entries. |
| `docs/microservices/architecture.md` | Rewrite current assessment to match extracted service state. |
| `docs/microservices/api-contract.md` | Mark AHP/Fuzzy AHP calculation endpoints as backend/manual/future workflow, not read-only page triggers. |
| `docs/frontend/*` | Remove active Reports page/nav assumptions or mark them historical. |
| `frontend/DESIGN.md` | Align sidebar/page inventory with removed Reports menu. |
