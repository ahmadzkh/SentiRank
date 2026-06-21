# Agent Instructions — SentiRank

## Required First Step

Before starting any task, read:

- `AGENTS.md`
- `CLAUDE.md`
- relevant Markdown documentation for the touched area

Examples:

- Frontend task: read `docs/frontend/*` and `frontend/DESIGN.md`
- Microservice task: read `docs/microservices/*`
- ML/data task: read `docs/methodology/*`, `docs/ml/*`, and relevant `ml-service/scripts/*`
- Docker/deployment task: read `docs/microservices/docker-compose-foundation.md`

Do not start editing before understanding the current project state.

## Default Skills

Apply these installed skills by default:

- `caveman`
- `caveman-compress`
- `ponytail`

Skill intent:

- `caveman` / `caveman-compress`: applies to Codex chat responses only. Keep reports short, dense, direct. No fluff. Do not compress documentation, audit reports, or academic content when completeness is required.
- `ponytail`: applies to code implementation. Write small, sharp, maintainable changes. Avoid boilerplate, broad rewrites, and unnecessary abstractions.

## Work Rules

- Change only files required by the current task.
- Prefer targeted patches over whole-file rewrites.
- Preserve existing structure unless the task explicitly asks for refactor.
- Do not add dependencies unless clearly required.
- Do not change runtime behavior outside the task scope.
- Do not write placeholders such as `// ... rest of code ...` into real source files.
- Do not commit or push.
- Do not delete files unless explicitly requested.
- Do not touch model binaries, saved model artifacts, secrets, or `.env` files.

## Project Context

SentiRank is a thesis project for Spotify review sentiment analysis and insight prioritization using:

- IndoBERT for sentiment classification
- SVM for aspect/criteria classification
- AHP and Fuzzy AHP for improvement priority ranking
- Next.js frontend
- FastAPI microservices
- Docker Compose for local/demo backend orchestration

Current architecture:

- `frontend/`: Next.js UI. Must call API Gateway only.
- `services/`: active runtime microservices.
- `ml-service/`: research pipeline, notebooks, scripts, quality audit, and model preparation utilities.
- `datasets/`: research artifacts and derived datasets.
- `docs/`: project, thesis, architecture, methodology, and frontend documentation.
- `saved_models/`: ignored by Git. Never commit model binaries.

Current persistence:

- API Gateway owns runtime inference history persistence.
- SQLite is local/demo default.
- PostgreSQL is optional for full online deployment.
- Prisma has been removed as unused legacy setup.

## Data Rules

- CSV/JSON research artifacts are valid for research pipeline outputs.
- Runtime user inference history belongs in the API Gateway persistence layer.
- Frontend must not read CSV/JSON directly.
- Frontend must not call internal services directly.
- Frontend must not calculate AHP/Fuzzy AHP.
- Do not expose internal file names, paths, or developer diagnostics in user-facing UI unless the task is explicitly about diagnostics.

## Frontend Rules

Frontend task tracker:

`docs/frontend/frontend-tasks.md`

For frontend-related tasks:

- Update relevant checklist item.
- Add subtasks when needed.
- Verify acceptance criteria before marking done.
- Never mark done if implementation or documentation is incomplete.
- Add a short note to the relevant frontend documentation.

Frontend documentation:

- `docs/frontend/frontend-tasks.md`
- `docs/frontend/design-references.md`
- `docs/frontend/design-decision-log.md`
- `docs/frontend/information-architecture.md`
- `docs/frontend/component-map.md`
- `docs/frontend/wireframes.md`
- `frontend/DESIGN.md`

Task status format:

- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `[!]` blocked

## Verification Rules

Run only checks relevant to the task.

Common checks:

- Frontend source changes: `npm run lint`, `npm run build`
- Python service/script changes: `python -m compileall ...`, relevant `pytest`
- Docker changes: `docker compose config`
- Documentation-only changes: no build/test required unless source files changed
- Data pipeline changes: run safe validation scripts; do not train models unless explicitly requested

Always clean generated cache before finishing:

- `__pycache__/`
- `.pytest_cache/`
- `.pytest_tmp/`
- `*.pyc`

## Response Rules

Final Codex response must be compact.

Include only:

- changed files
- verification result
- blockers or TODO
- skipped checks with reason

Do not include long explanations, repeated context, or verbose summaries.
