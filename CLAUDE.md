# CLAUDE.md — SentiRank

> This project uses English-only technical documentation. AI coding agents must follow all rules defined in this file.

---

## 1. Project Overview

| Field       | Detail                                         |
| ----------- | ---------------------------------------------- |
| **Name**    | SentiRank                                      |
| **Type**    | AI-based Decision Support Dashboard            |
| **Domain**  | Sentiment Analysis + AHP Recommendation System |
| **Version** | v0.1.0                                         |
| **Status**  | Active Development                             |

### Description

SentiRank is a web-based dashboard application for analyzing public review sentiment using **IndoBERT**, classifying review aspects using **SVM**, and generating recommendation rankings using the **AHP** method.

The system focuses on identifying priority areas for application/service improvement based on user reviews.

### Main Objectives

- Analyze sentiment automatically
- Classify review aspects
- Support AHP weighting calculations
- Generate improvement priority rankings
- Visualize analytical insights interactively

### Target Users

- Researchers
- Students
- Academic evaluators
- Product analysts

### Project Scope

| This project IS         | This project is NOT            |
| ----------------------- | ------------------------------ |
| AI research dashboard   | A SaaS platform                |
| Analytics platform      | A multi-user system            |
| Decision support system | An authentication-based system |

---

## 2. Tech Stack

### Frontend

| Layer      | Technology   |
| ---------- | ------------ |
| Framework  | Next.js 15   |
| Language   | TypeScript   |
| Styling    | Tailwind CSS |
| UI Library | shadcn/ui    |
| Charts     | Recharts     |

### Backend

| Layer    | Technology             |
| -------- | ---------------------- |
| API      | Next.js Route Handlers |
| ORM      | Prisma                 |
| Database | SQLite                 |

### Machine Learning

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| Sentiment Model   | IndoBERT                    |
| Aspect Classifier | SVM                         |
| Deep Learning     | PyTorch                     |
| ML Utilities      | scikit-learn, pandas, NumPy |

### Package Managers

| Scope              | Manager |
| ------------------ | ------- |
| Frontend & Backend | `npm`   |
| Python Environment | `uv`    |

> **Never use:** `pnpm`, `yarn`, `pipenv`, `poetry`

---

## 3. Commands

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Run production build
npm run lint          # Run linter
npm run format        # Format code

# Package Management
npm install           # Install all dependencies
npm install [package] # Install a new package

# Testing
npm run test          # Run all tests
npm run test:unit     # Run unit tests only
npm run test:e2e      # Run e2e tests only

# Database
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed initial data
npm run db:reset      # Reset database

# Python ML Service
uv sync               # Sync Python dependencies
uv run python [file]  # Run Python script in venv
```

---

## 4. System Architecture

```
User
  ↓
Next.js Dashboard (UI Layer)
  ↓
Next.js API Route Handlers
  ↓
ML Processing Service
  ├── Preprocessing
  ├── IndoBERT Sentiment Analysis
  ├── SVM Aspect Classification
  └── AHP Ranking Calculation
  ↓
SQLite Database (via Prisma)
  ↓
Visualization Dashboard (Recharts)
```

### ML Pipeline

```
Dataset
  → Cleaning
  → Tokenization
  → Sentiment Analysis      (IndoBERT)
  → Aspect Classification   (SVM)
  → AHP Weighting
  → Ranking Generation
```

---

## 5. Dashboard Features

| Module                       | Description                            |
| ---------------------------- | -------------------------------------- |
| Landing Page                 | Entry point and project overview       |
| Dataset Information          | Display raw dataset details            |
| Dataset Statistics           | Summary statistics of the dataset      |
| Sentiment Analysis Result    | Sentiment distribution and breakdown   |
| Aspect Classification Result | Aspect labeling results                |
| Model Evaluation             | Accuracy, precision, recall, F1-score  |
| AHP Weight Result            | Pairwise comparison matrix and weights |
| Priority Improvement Ranking | Final ranked recommendations           |
| Visualization & Charts       | Interactive charts and graphs          |

---

## 6. Project Structure

Architecture: **Feature-based modular architecture with strict separation between Next.js frontend, Next.js API Route Handlers, and Python ML service**

```
SentiRank/
│
├── app/                                    # Next.js App Router — routing and pages only
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Landing page
│   ├── api/                                # Next.js API Route Handlers (backend boundary)
│   │   ├── dataset/
│   │   │   └── route.ts                    # Dataset read endpoints
│   │   ├── sentiment/
│   │   │   └── route.ts                    # Sentiment result endpoints
│   │   ├── aspects/
│   │   │   └── route.ts                    # Aspect result endpoints
│   │   ├── evaluation/
│   │   │   └── route.ts                    # Model evaluation endpoints
│   │   ├── ahp/
│   │   │   └── route.ts                    # AHP weight endpoints
│   │   └── ranking/
│   │       └── route.ts                    # Priority ranking endpoints
│   └── dashboard/                          # Dashboard pages (UI routing only)
│       ├── layout.tsx                      # Dashboard shell layout
│       ├── page.tsx                        # Dashboard entry / overview
│       ├── dataset/
│       │   └── page.tsx                    # Dataset information view
│       ├── sentiment/
│       │   └── page.tsx                    # Sentiment analysis results view
│       ├── aspects/
│       │   └── page.tsx                    # Aspect classification results view
│       ├── evaluation/
│       │   └── page.tsx                    # Model evaluation view
│       ├── ahp/
│       │   └── page.tsx                    # AHP weights view
│       └── ranking/
│           └── page.tsx                    # Priority improvement ranking view
│
├── components/                             # Reusable UI components only — no logic
│   ├── ui/                                 # shadcn/ui primitives and overrides
│   ├── charts/                             # Recharts wrappers and chart components
│   ├── dashboard/                          # Dashboard layout components (sidebar, header)
│   └── shared/                             # Generic reusable components (badges, cards, etc.)
│
├── features/                               # Feature-specific frontend logic
│   ├── dataset/                            # Dataset display hooks, types, transformers
│   ├── sentiment/                          # Sentiment display hooks, types, transformers
│   ├── aspects/                            # Aspect display hooks, types, transformers
│   ├── ahp/                                # AHP display hooks, types, transformers
│   └── ranking/                            # Ranking display hooks, types, transformers
│
├── services/                               # All service-layer abstractions
│   ├── api/                                # Frontend HTTP clients — fetch calls to app/api/
│   ├── ml/                                 # Next.js ↔ Python ML service communication layer
│   └── database/                           # Database access abstractions and repository functions
│
├── lib/                                    # Shared utilities — no business logic
│   ├── prisma/                             # Prisma client singleton (client.ts only)
│   ├── utils/                              # Pure utility functions (formatters, helpers)
│   ├── constants/                          # App-wide constants and enums
│   └── validators/                         # Input/output validation schemas (zod)
│
├── prisma/                                 # Prisma ORM configuration
│   ├── schema.prisma                       # Database schema definition
│   ├── migrations/                         # Auto-generated migration files
│   └── seed.ts                             # Database seed script
│
├── ml-service/                             # Python ML service — fully independent from Next.js
│   ├── app/                                # FastAPI runtime (ML inference API)
│   │   ├── main.py                         # FastAPI app entry point
│   │   ├── routers/                        # FastAPI route definitions
│   │   │   ├── sentiment.py                # /sentiment endpoint
│   │   │   ├── aspects.py                  # /aspects endpoint
│   │   │   ├── ahp.py                      # /ahp endpoint
│   │   │   └── ranking.py                  # /ranking endpoint
│   │   ├── schemas/                        # Pydantic request/response models
│   │   └── dependencies.py                 # Shared FastAPI dependencies
│   ├── notebooks/                          # CRISP-DM research notebooks (experimental only)
│   │   ├── 01_business_understanding.ipynb
│   │   ├── 02_data_understanding.ipynb
│   │   ├── 03_data_preparation.ipynb
│   │   ├── 04_modeling.ipynb
│   │   ├── 05_evaluation.ipynb
│   │   └── 06_deployment_notes.ipynb
│   ├── scripts/                            # Reproducible, non-interactive Python scripts
│   │   ├── preprocess.py                   # Dataset cleaning and tokenization
│   │   ├── train_indobert.py               # IndoBERT fine-tuning script
│   │   ├── train_svm.py                    # SVM training script
│   │   ├── run_ahp.py                      # AHP calculation script
│   │   └── evaluate.py                     # Model evaluation script
│   ├── models/                             # Model class definitions and configurations
│   │   ├── indobert_model.py               # IndoBERT model class
│   │   └── svm_model.py                    # SVM model class
│   ├── saved_models/                       # Trained and serialized model artifacts
│   │   ├── indobert/                       # Fine-tuned IndoBERT weights
│   │   └── svm/                            # Serialized SVM model (joblib/pickle)
│   ├── tests/                              # Python unit tests for ML logic
│   │   ├── test_preprocessing.py
│   │   ├── test_indobert_inference.py
│   │   ├── test_svm_inference.py
│   │   └── test_ahp.py
│   ├── pyproject.toml                      # Python project config and dependencies (uv)
│   └── .venv/                              # Local Python virtual environment (never commit)
│
├── datasets/                               # Dataset files — immutable raw, derived processed
│   ├── raw/                                # Original scraped data — never modify directly
│   ├── processed/                          # Cleaned and tokenized data — generated by scripts
│   └── outputs/                            # Inference results, evaluation metrics, AHP outputs, rankings
│
├── docs/                                   # Project documentation and exported figures
│   ├── figures/                            # Exported EDA plots, evaluation charts, ranking visuals
│   └── README.md                           # Documentation entry point
│
├── tests/                                  # Frontend and API tests (Jest / Vitest)
│   ├── unit/                               # Unit tests for utilities and feature logic
│   └── integration/                        # Integration tests for Next.js API Route Handlers
│
├── public/                                 # Static public assets served by Next.js
│
├── .env                                    # Environment variables — never commit
├── .env.example                            # Documented env template — always keep updated
├── .gitignore
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

### File Placement Rules

| Path | Responsibility |
| --- | --- |
| `app/` | Next.js routing only — pages and layouts; no business logic |
| `app/api/` | Next.js API Route Handlers only — the backend boundary between UI and data |
| `components/` | Reusable UI components only — no ML, AHP, or database logic |
| `features/` | Feature-specific frontend logic — hooks, types, data transformers per dashboard module |
| `services/api/` | Frontend HTTP clients — all `fetch()` calls targeting `app/api/` routes |
| `services/ml/` | Communication layer between Next.js Route Handlers and the Python ML service |
| `services/database/` | Database access abstractions and repository functions — wraps Prisma queries |
| `lib/prisma/` | Prisma client singleton only — no query logic here |
| `prisma/` | Prisma schema, migrations, and seed scripts only |
| `ml-service/app/` | FastAPI ML service runtime — inference endpoints exposed to `services/ml/` |
| `ml-service/notebooks/` | CRISP-DM notebooks for research and experimentation only — not imported by production code |
| `ml-service/scripts/` | Reproducible, non-interactive Python scripts for preprocessing, training, and evaluation |
| `ml-service/models/` | Python model class definitions and configurations — not trained weights |
| `ml-service/saved_models/` | Trained and serialized model artifacts only — not source code |
| `datasets/raw/` | Original scraped data — read-only; never modified directly |
| `datasets/processed/` | Cleaned and preprocessed data — always generated from scripts or notebooks |
| `datasets/outputs/` | Inference results, evaluation metrics, AHP matrix outputs, and ranking results |
| `docs/figures/` | Exported EDA plots, evaluation charts, and ranking visuals — generated, not hand-crafted |
| `tests/` | Frontend unit tests and Next.js API Route Handler integration tests |
| `ml-service/tests/` | Python unit tests for preprocessing, ML inference, and AHP calculation logic |

> **Never create new top-level folders without confirmation.**

---

### Architecture Boundary Rules

These rules define hard boundaries between system layers. No exceptions without explicit confirmation.

```
# UI Layer
- UI components must not contain ML logic, AHP calculation logic, or Prisma queries
- Next.js pages must call feature hooks or services layers — never call Prisma directly
- Client Components must not import server-only modules

# API Layer
- app/api/ Route Handlers are the only backend entry point for the frontend
- Route Handlers delegate to services/database/ or services/ml/ — no inline logic
- Route Handlers must validate all inputs before delegating

# ML Service Layer
- ml-service/app/ is a standalone FastAPI service — it must not import Next.js internals
- ML inference must be exposed through ml-service/app/ API endpoints only
- services/ml/ is the only Next.js module allowed to call the ML service

# Data and Artifacts
- datasets/raw/ must never be modified directly — always treat as immutable source
- datasets/processed/ must be generated only from scripts or notebooks — not manually edited
- ml-service/saved_models/ must not contain source code — trained artifacts only
- saved model artifacts must not be mixed with model definition source files

# Notebooks
- ml-service/notebooks/ is for CRISP-DM research and experimentation only
- Notebooks must not be imported or called by production code (app/, services/, features/)
- Findings from notebooks must be extracted into scripts for reproducible execution

# Database
- All database access must go through Prisma via services/database/ or lib/prisma/
- Raw SQL queries are not allowed — use Prisma query API only
- Database credentials must never be exposed to the client side
```

---

## 7. Naming Conventions

```
# Files and Folders
- Components      : PascalCase      e.g. SentimentChart.tsx
- Non-components  : camelCase       e.g. useAhpWeights.ts, formatScore.ts
- Folders         : kebab-case      e.g. aspect-classification/
- Pages           : page.tsx
- Layout          : layout.tsx
- Test files      : [name].test.ts or [name].spec.ts

# Inside Code
- Variables       : camelCase       e.g. sentimentData, isLoading
- Constants       : UPPER_SNAKE     e.g. MAX_ASPECTS, BASE_URL
- Functions       : camelCase       e.g. getAhpRanking, formatLabel
- Types/Interface : PascalCase      e.g. SentimentResult, AhpWeight
- Enums           : PascalCase      e.g. SentimentLabel, AspectType
- CSS Classes     : kebab-case      e.g. sentiment-card, rank-table

# Git Branches
- New feature     : feat/[feature-name]
- Bug fix         : fix/[bug-name]
- Hotfix          : hotfix/[name]
- Refactor        : refactor/[name]
```

---

## 8. Code Conventions

```
# General Approach
- Apply Clean Code principles
- Apply SOLID principles
- Avoid code duplication — extract to functions if used more than once
- Write readable code, not the shortest code

# TypeScript
- strict mode is required
- Never use type 'any'
- Always write explicit function return types
- Use interface for objects, type for union or intersection

# Import Order
1. External libraries (React, Next.js, etc.)
2. Internal absolute paths (@/components, @/lib, etc.)
3. Internal relative paths (./Component, ../utils)
4. Types and interfaces
5. Assets and styles

# Export Pattern
- Use named exports for all components and functions
- Use default export only for page.tsx and layout.tsx
```

---

## 9. Component Rules

```
# Component File Structure Order
1. Imports
2. Type or interface definitions
3. Component definition
4. Hooks (useState, useEffect, etc.)
5. Handlers and local functions
6. Return JSX

# Props Rules
- Always explicitly type props
- Use default values for optional props
- Keep props minimal — avoid prop drilling

# Server vs Client Components (Next.js)
- Default: use Server Components
- Use 'use client' ONLY when needed:
    useState / useEffect / other hooks
    Event listeners (onClick, onChange, etc.)
    Browser APIs (localStorage, window, etc.)
    Libraries that do not support SSR

# Component Splitting
- Extract to its own file if used in more than one place
- May be co-located if used only within one parent component
- Never put business logic directly inside UI components
```

---

## 10. Styling Rules

```
# Styling Approach
- Tailwind CSS only — no CSS Modules, no Styled Components
- No inline styles, except for truly dynamic values
- No !important

# Tailwind CSS
- Use utility classes directly in JSX
- Use clsx or cn() for conditional classes
- Extract to a component if the same class combination is used more than once
- Class order: layout > spacing > sizing > color > typography > state

# Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px) / md (768px) / lg (1024px) / xl (1280px)

# Dark Mode
- Use Tailwind dark: prefix
- Always test dark mode after creating a new component

# Design Tokens
- Use CSS variables defined by shadcn/ui theming
- Never hardcode raw color values directly
```

---

## 11. API Rules

```
# Standard Response Format (all endpoints)
{
  "success": true | false,
  "message": "Descriptive message here",
  "data": {} | [] | null
}

# API Rules
- Validate all inputs before processing
- Always wrap handlers in try-catch
- Return proper HTTP status codes:
    200 — OK
    400 — Bad Request
    404 — Not Found
    422 — Unprocessable Entity
    500 — Internal Server Error
- Never expose internal errors or stack traces to the client
- Store all fetch functions in services/api/ — never inline in components

# Environment
- Use environment variables for all URLs and API keys
- Never hardcode any URL or secret directly in code
```

---

## 12. Machine Learning Rules

### IndoBERT

Used **only** for sentiment analysis.

| Label      | Meaning            |
| ---------- | ------------------ |
| `Positive` | Positive sentiment |
| `Neutral`  | Neutral sentiment  |
| `Negative` | Negative sentiment |

### SVM

Used **only** for aspect classification.

| Example Aspects  |
| ---------------- |
| UI/UX            |
| Performance      |
| Features         |
| Stability        |
| Customer Service |

### ML Pipeline

```
Dataset
  → Cleaning
  → Tokenization
  → IndoBERT Sentiment Analysis
  → SVM Aspect Classification
  → AHP Weighting
  → Ranking Generation
```

---

## 13. Python Environment Rules

```
# Package Manager
- Always use uv for Python environment management
- Always use project-local virtual environment (.venv)
- Never install global Python packages
- Never use pip directly unless absolutely necessary

# Running Scripts
uv sync                         # Sync all dependencies from pyproject.toml
uv run python ml-service/[file] # Run a script inside the venv
```

---

## 14. Database Rules

- SQLite is the primary and **only** database for this project
- Managed exclusively via **Prisma ORM**
- Never expose the `.db` file path publicly
- Never run destructive queries without confirmation
- Never create migrations without confirmation
- Never expose database credentials to the client side

> **Why SQLite?** Lightweight, zero-config setup, sufficient for research-scale data, and fully compatible with Prisma.

---

## 15. Git Rules

Commit after every meaningful change before moving to the next task. This ensures you can compare before/after and revert if needed.

```
# Commit Message Format
feat     : [description of new feature]
fix      : [description of bug fix]
refactor : [description of refactor change]
style    : [styling or formatting changes]
docs     : [documentation changes]
test     : [test additions or changes]
chore    : [config or tooling changes]

# Examples
feat: implement IndoBERT sentiment inference endpoint
fix: resolve AHP matrix normalization calculation error
refactor: extract ranking table into reusable component
docs: update CLAUDE.md with ML pipeline rules

# Additional Rules
- Never commit .env or any file containing secrets
- One commit per specific, focused change
- Never mix unrelated changes in a single commit
```

---

## 16. Testing Rules

```
# Testing Approach
- Framework: Jest / Vitest (frontend), pytest (ML service)

# What Must Be Tested
- All preprocessing functions
- AHP ranking calculations
- ML inference API endpoints
- Utility functions and helpers

# What Does NOT Need Testing
- Simple presentational components
- Third-party library internals
- Static configuration files

# Test Writing Rules
- One test file per source file
- Test names must be descriptive:
  'should [expected behavior] when [condition]'
- Follow AAA pattern: Arrange → Act → Assert

# Coverage Target
- Minimum: 70%
- Priority: ML functions > ranking calculations > API > UI components
```

---

## 17. Environment Variables

```bash
# Database
DATABASE_URL="file:./dev.db"

# App
NEXT_PUBLIC_APP_NAME="SentiRank"

# ML Model Paths — server-only, never expose to client
ML_MODEL_PATH=""
SVM_MODEL_PATH=""
INDOBERT_MODEL_PATH=""
```

> **Rules:**
>
> - Copy `.env.example` to `.env` for local development
> - Never commit `.env` to the repository
> - `NEXT_PUBLIC_` variables are safe for client-side use
> - All other variables are **server-only**

---

## 18. Features

```
# Completed and working
- [ ] (none yet — v0.1.0)

# In progress — do not modify without confirmation
- [ ] Project scaffolding and structure setup
- [ ] Prisma schema definition
- [ ] ML preprocessing pipeline

# Not yet started
- [ ] IndoBERT sentiment inference integration
- [ ] SVM aspect classification integration
- [ ] AHP calculation engine
- [ ] Priority ranking generator
- [ ] Dashboard: Dataset module
- [ ] Dashboard: Sentiment module
- [ ] Dashboard: Aspect module
- [ ] Dashboard: Evaluation module
- [ ] Dashboard: AHP module
- [ ] Dashboard: Ranking module
- [ ] Recharts data visualizations
```

---

## 19. Development Priority

```
1. ML pipeline correctness       (IndoBERT + SVM + AHP accuracy)
2. AHP calculation accuracy      (correct pairwise matrix & ranking)
3. Dashboard clarity             (readable, intuitive UI)
4. Maintainability               (clean, modular, well-structured code)
5. Performance                   (optimize only after correctness is confirmed)
```

> This is an **AI research system first** — not a commercial SaaS application. Prioritize analytical correctness over features or aesthetics.

---

## 20. Do Not

If any instruction or prompt is ambiguous, **ask first before coding**. Never assume and proceed without confirmation.

```
# Structure and Files
- Do not create new folders without confirmation
- Do not delete files without confirmation
- Do not move files without confirmation
- Do not change existing folder structure

# Code
- Do not use type 'any' in TypeScript
- Do not hardcode values that should come from environment variables
- Do not commit .env or any file containing secrets
- Do not install new packages without confirmation
- Do not remove or change working features without explicit instruction

# Forbidden Patterns
- Do not add an authentication system
- Do not add multi-user features
- Do not add unnecessary CRUD systems
- Do not use useEffect for data fetching
- Do not use inline styles for values that can use utility classes
- Do not mix business logic inside UI components

# Database
- Do not use PostgreSQL
- Do not use MongoDB
- Do not run commands that modify or delete production data
- Do not create database migrations without confirmation
- Do not expose database credentials to the client

# Security
- Do not expose API keys or any secret to the client
- Do not bypass user input validation
- Do not skip error handling in API routes
- Do not expose the SQLite .db file path publicly
- Do not expose sanitized dataset files outside the server
```

---

_This file defines the rules and context for SentiRank. Keep it updated as the project evolves. The more specific and accurate this file is, the better the results from any AI coding agent._
