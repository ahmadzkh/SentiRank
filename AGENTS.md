### Agent Instructions — SentiRank

### Default Installed Skills

Apply these installed Codex skills by default for all SentiRank tasks:

1. **`caveman` / `caveman-compress`**
   - Applies to Codex chat responses only.
   - Keep final progress reports short, dense, and direct.
   - Avoid conversational filler, repeated explanations, and long summaries.
   - Do not shorten source code, documentation, audit reports, or academic content when the task requires completeness.
   - Still report required items: changed files, verification results, blockers, TODO, suggested git add, and commit message.

2. **`ponytail`**
   - Applies to code implementation only.
   - Prefer minimal, targeted, senior-level code changes.
   - Avoid broad rewrites, unnecessary abstractions, and boilerplate.
   - Preserve existing project structure unless the milestone explicitly asks for refactor.
   - Use modern built-in features and simple patterns where appropriate.
   - Never write placeholder text such as `// ... rest of code ...` into actual source files.

### Code Editing Rules

- Change only files required by the current milestone.
- Do not rewrite whole files when a targeted patch is enough.
- Preserve unchanged code.
- Do not add dependencies unless clearly necessary.
- Do not change runtime behavior outside the requested scope.
- Do not commit, push, or delete files unless explicitly instructed.

### Project Context

SentiRank is a thesis project for Spotify review sentiment analysis and insight prioritization using IndoBERT, SVM aspect classification, AHP, and Fuzzy AHP.

Current architecture:

- `frontend/` is the Next.js UI and must call API Gateway only.
- `services/` contains active runtime microservices.
- `ml-service/` contains research pipeline scripts, notebooks, quality audit, and model preparation utilities.
- `datasets/` contains research artifacts.
- Runtime inference history is persisted by API Gateway repository code.
- SQLite is the local/demo default database.
- PostgreSQL remains optional for deployment.
- Prisma has been removed as unused legacy setup.
- `saved_models/` is ignored by Git; never commit model binaries.

### Frontend Task Tracking

The frontend task tracker is located at:

`docs/frontend/frontend-tasks.md`

Whenever completing a frontend-related task:

1. Update the relevant checklist item.
2. Add or update subtasks if needed.
3. Verify acceptance criteria before marking a task as done.
4. Never mark a task as done if implementation or documentation is incomplete.
5. Add a short note to the relevant documentation file.

### Frontend Documentation Files

- `docs/frontend/frontend-tasks.md`
- `docs/frontend/design-references.md`
- `docs/frontend/design-decision-log.md`
- `docs/frontend/information-architecture.md`
- `docs/frontend/component-map.md`
- `docs/frontend/wireframes.md`
- `frontend/DESIGN.md`

### Completion Rule

Use:

- `[ ]` for not started
- `[~]` for in progress
- `[x]` for done
- `[!]` for blocked

A task can only be marked `[x]` when all acceptance criteria are satisfied.

### Verification Rule

Before reporting completion, run only checks relevant to the milestone.

Common checks:

- Frontend changes: `npm run lint`, `npm run build`
- Python service changes: `python -m compileall ...`, relevant `pytest`
- Docker changes: `docker compose config`
- Documentation-only changes: no build/test required unless source files changed

Always report:

- changed files
- verification commands and results
- skipped checks with reason
- remaining risks/TODO
- suggested git add command
- suggested commit message
