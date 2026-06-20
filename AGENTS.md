### Agent Instructions — SentiRank

### Global Behavior Modifiers (Auto-Enforced Skills)

You must automatically and implicitly apply the following installed Codex skills to ALL interactions, tasks, and code generations without needing explicit prompt triggers:

1.  **`/caveman full` (Communication Protocol):**
    - Strip all conversational fluff, greetings, and pleasantries.
    - Respond in ultra-dense, short, and fragmented sentences.
    - Deliver the core answer or code block immediately in the first line.
2.  **`/ponytail` (Senior Developer Coding Principle):**
    - Write minimal, highly efficient code. Avoid long boilerplate.
    - Use syntax shortcuts and modern built-in features.
    - Strictly use placeholders (e.g., `// ... rest of code ...`) for unchanged parts of files. Never rewrite existing, untouched code blocks.

---

### Project Context

SentiRank is a thesis project for Spotify review sentiment analysis and insight prioritization using IndoBERT, SVM aspect classification, AHP, and Fuzzy AHP.

### Frontend Task Tracking

The frontend task tracker is located at:

`docs/frontend/frontend-tasks.md`

Whenever you complete a frontend-related task, you must:

1.  Update the relevant checklist item.
2.  Add or update subtasks if needed.
3.  Verify the acceptance criteria before marking a task as done.
4.  Never mark a task as done if implementation or documentation is incomplete.
5.  Add a short note to the relevant documentation file.

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
