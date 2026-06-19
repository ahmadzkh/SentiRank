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

### Current Architecture Status

SentiRank is now in a thesis-stage microservice refactor. The active frontend integration boundary is `api-gateway-service`; frontend code must not call internal service ports directly and must not read local CSV/JSON artifacts.

The canonical microservice and data-source policy is documented in `docs/microservices/architecture.md`. If this file conflicts with that architecture document, the microservice architecture document is the source of truth for service ownership and data-source boundaries.

### Data Source Policy

Research CSV/JSON/model artifacts are allowed and expected for reproducible thesis outputs such as scraped datasets, preprocessing output, labeling output, model evaluation metrics, AHP output, Fuzzy AHP output, ranking comparison output, and dashboard/report snapshots derived from research outputs.

Runtime services may read those artifacts only as read-only research evidence under clear service ownership. They must not present artifact data as live user-generated runtime data.

The database is reserved for user-facing runtime inference history: submitted review text, sentiment result, aspect/criteria result, confidence/probability, model version, prediction source, timestamp, and related inference history. Do not migrate all research CSV/JSON artifacts into the database for this milestone.

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

| Layer | Technology |
| --- | --- |
| Public API | FastAPI `api-gateway-service` |
| Internal services | FastAPI review, sentiment, aspect, decision, and report services |
| Research artifacts | Versioned CSV/JSON/model outputs, read-only at runtime |
| Runtime persistence | API Gateway repository persistence for user inference history only |
| Database modes | SQLite local/demo fallback and optional PostgreSQL deployment via `DATABASE_URL` or `API_GATEWAY_DATABASE_URL` |

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

# Python ML Service
uv sync               # Sync Python dependencies
uv run python [file]  # Run Python script in venv
```

---

## 4. System Architecture

```
User
  ↓
Next.js frontend-service (UI Layer)
  ↓
api-gateway-service (public API boundary)
  ↓
Domain FastAPI services
  ├── review-service
  ├── sentiment-service
  ├── aspect-service
  ├── decision-service
  └── report-service
  ↓
Read-only research artifacts for thesis outputs
  ↓
Runtime database only for user inference history
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

Architecture: **Thesis-stage microservice architecture with strict separation between Next.js frontend, API Gateway, domain FastAPI services, read-only research artifacts, and runtime inference-history persistence**

```
SentiRank/
│
├── app/                                    # Next.js App Router — routing and pages only
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Landing page
│   ├── api/                                # Legacy/planned Next.js Route Handlers; not the active microservice boundary
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
│   ├── utils/                              # Pure utility functions (formatters, helpers)
│   ├── constants/                          # App-wide constants and enums
│   └── validators/                         # Input/output validation schemas (zod)
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
│   ├── notebooks/                          # Research notebooks — documentation and experimentation only
│   │   ├── 01_data_acquisition.ipynb       # Scraping strategy, raw data inspection
│   │   ├── 02_preprocessing.ipynb          # Cleaning, tokenization, label distribution analysis
│   │   ├── 03_indobert_sentiment_modeling.ipynb   # IndoBERT fine-tuning and sentiment analysis
│   │   ├── 04_svm_aspect_classification.ipynb     # SVM training and aspect classification
│   │   ├── 05_model_evaluation.ipynb       # Accuracy, precision, recall, F1 for both models
│   │   ├── 06_ahp_priority_ranking.ipynb   # AHP pairwise matrix, weights, and ranking
│   │   ├── 07_fuzzy_ahp_priority_ranking.ipynb    # Fuzzy AHP weights and ranking
│   │   └── 08_ranking_comparison_analysis.ipynb   # AHP vs Fuzzy AHP comparison and conclusions
│   ├── scripts/                            # Reproducible, non-interactive Python scripts
│   │   ├── scrape_reviews.py               # Review data acquisition from source
│   │   ├── label_by_rating.py              # Assign initial sentiment labels from star rating
│   │   ├── relabel_by_keywords.py          # Refine labels using keyword-based rules
│   │   ├── preprocess_indobert.py          # Tokenization and encoding for IndoBERT
│   │   ├── preprocess_svm.py               # Feature extraction and encoding for SVM
│   │   ├── train_indobert.py               # IndoBERT fine-tuning script
│   │   ├── train_svm.py                    # SVM training script
│   │   ├── evaluate_models.py              # Evaluate both models and export metrics
│   │   ├── generate_ahp_ranking.py         # Run AHP calculation and export ranking
│   │   ├── generate_fuzzy_ahp_ranking.py   # Run Fuzzy AHP calculation and export ranking
│   │   └── compare_rankings.py             # Compare AHP vs Fuzzy AHP ranking outputs
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
│   │   ├── test_ahp.py
│   │   └── test_fuzzy_ahp.py
│   ├── pyproject.toml                      # Python project config and dependencies (uv)
│   └── .venv/                              # Local Python virtual environment (never commit)
│
├── datasets/                               # Dataset files — immutable raw, derived processed
│   ├── raw/                                # Original scraped data — never modify directly
│   ├── processed/                          # Cleaned and tokenized data — generated by scripts or notebooks
│   └── outputs/                            # All generated result files
│       ├── sentiment_results.csv           # Per-review sentiment predictions
│       ├── aspect_classification_results.csv  # Per-review aspect predictions
│       ├── model_evaluation_results.csv    # Accuracy, precision, recall, F1 for both models
│       ├── ahp_weights.csv                 # Normalized AHP criteria weights
│       ├── ahp_ranking.csv                 # Priority ranking from AHP
│       ├── fuzzy_ahp_weights.csv           # Normalized Fuzzy AHP criteria weights
│       ├── fuzzy_ahp_ranking.csv           # Priority ranking from Fuzzy AHP
│       └── ranking_comparison.csv          # Side-by-side AHP vs Fuzzy AHP ranking comparison
│
├── docs/                                   # Project documentation and exported figures
│   ├── figures/                            # Exported visuals — generated from notebooks or scripts
│   │   ├── 01_data_acquisition/            # Raw data distribution, source stats
│   │   ├── 02_preprocessing/               # Label distribution, token length plots
│   │   ├── 03_indobert/                    # Training curves, confusion matrix (sentiment)
│   │   ├── 04_svm/                         # Feature importance, confusion matrix (aspect)
│   │   ├── 05_evaluation/                  # Comparative evaluation charts
│   │   ├── 06_ahp/                         # AHP pairwise matrix and weight bar chart
│   │   ├── 07_fuzzy_ahp/                   # Fuzzy AHP membership functions and weight chart
│   │   └── 08_ranking_comparison/          # AHP vs Fuzzy AHP side-by-side ranking visual
│   └── README.md                           # Documentation entry point
│
├── tests/                                  # Frontend and API tests (Jest / Vitest)
│   ├── unit/                               # Unit tests for utilities and feature logic
│   └── integration/                        # Frontend/API integration tests
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
| `app/api/` | Legacy Next.js Route Handler boundary only; do not add new frontend integration here for microservice work |
| `components/` | Reusable UI components only — no ML, AHP, or database logic |
| `features/` | Feature-specific frontend logic — hooks, types, data transformers per dashboard module |
| `frontend/services/` | Frontend service layer; all browser-facing API calls must use API Gateway routes |
| `frontend/lib/http-client.ts` | Gateway HTTP client using `NEXT_PUBLIC_API_BASE_URL` and server-side `API_GATEWAY_INTERNAL_URL` |
| `services/api-gateway/` | Public API Gateway boundary; normalizes routing, response envelopes, and frontend-facing errors |
| `services/review-service/` | Review dataset metadata, scraping summaries, preprocessing summaries, and review samples |
| `services/sentiment-service/` | Sentiment model metadata, summaries, evaluation, and sentiment inference behavior |
| `services/aspect-service/` | Aspect classification metadata, summaries, evaluation, and aspect inference behavior |
| `services/decision-service/` | AHP, Fuzzy AHP, criteria, judgement processing, weighting, and ranking comparison calculations |
| `services/report-service/` | Read-only dashboard/report aggregation over owned research outputs |
| `services/database/` | Legacy/optional database access boundary; use only for runtime inference history work |
| `ml-service/app/` | Legacy modular FastAPI ML runtime kept for research/transition work; extracted services own frontend-facing runtime APIs |
| `ml-service/notebooks/` | Research notebooks for documentation and experimentation only — 8 notebooks map 1-to-1 with research stages; never imported by production code |
| `ml-service/scripts/` | Reproducible, non-interactive Python scripts — one script per pipeline stage; AHP and Fuzzy AHP must remain in separate scripts |
| `ml-service/models/` | Python model class definitions and configurations — not trained weights |
| `ml-service/saved_models/` | Trained and serialized model artifacts only — not source code |
| `datasets/raw/` | Original scraped data — read-only; never modified directly |
| `datasets/processed/` | Cleaned and preprocessed data — always generated from scripts or notebooks; never edited manually |
| `datasets/outputs/` | All generated result files: sentiment predictions, aspect predictions, evaluation metrics, AHP weights, Fuzzy AHP weights, rankings, and comparison outputs |
| `docs/figures/` | Exported visuals organized per research stage (01–08) — generated from notebooks or scripts; never created manually |
| `tests/` | Frontend unit tests and Next.js API Route Handler integration tests |
| `ml-service/tests/` | Python unit tests for preprocessing, ML inference, and AHP calculation logic |

> **Never create new top-level folders without confirmation.**

---

### Architecture Boundary Rules

These rules define hard boundaries between system layers. No exceptions without explicit confirmation.

```
# UI Layer
- UI components must not contain ML logic, AHP calculation logic, or database queries
- Next.js pages must call frontend service-layer modules that target API Gateway routes
- Frontend code must not read CSV/JSON artifacts directly
- Frontend code must not call internal service ports 8001 through 8005 directly
- Client Components must not import server-only modules

# API Layer
- api-gateway-service is the only backend API entry point for the frontend
- API Gateway delegates to domain services over HTTP and normalizes response/error envelopes
- Domain service routers must validate inputs before delegating

# Domain Service Layer
- Extracted FastAPI services must not import Next.js internals
- review-service owns review/dataset artifact summaries and review samples
- sentiment-service owns IndoBERT sentiment metadata, summaries, evaluation, and inference behavior
- aspect-service owns SVM aspect metadata, summaries, evaluation, and inference behavior
- decision-service owns AHP, Fuzzy AHP, criteria, judgement processing, weighting, and ranking comparison calculations
- report-service owns read-only aggregation for dashboard/report views

# Data and Artifacts
- datasets/raw/ must never be modified directly — always treat as immutable source
- datasets/processed/ must be generated only from scripts or notebooks — never edited manually
- datasets/outputs/ contains reproducible research outputs and may be read by backend services as read-only artifacts under explicit ownership
- ml-service/saved_models/ must not contain source code — trained artifacts only
- saved model artifacts must not be mixed with model definition source files
- AHP and Fuzzy AHP must be implemented in entirely separate notebooks and separate scripts
- Ranking comparison must be handled in its own dedicated notebook (08) and script (compare_rankings.py)
- All output files must be written to datasets/outputs/ — never to raw/ or processed/
- Do not migrate all research CSV/JSON artifacts into the database for this milestone

# Notebooks
- ml-service/notebooks/ is for research, experimentation, and academic documentation only
- Each notebook maps to exactly one research stage — do not merge stages into a single notebook
- Notebooks must not be imported or called by production code (app/, services/, features/)
- Findings and validated logic from notebooks must be extracted into scripts for reproducible execution
- Figures exported from notebooks must be saved to the corresponding docs/figures/[stage]/ subfolder

# Database
- Database usage is reserved for user-submitted runtime inference history unless a later milestone explicitly expands scope
- Runtime inference history may include submitted text, sentiment/aspect result, confidence/probability, model version, prediction source, and created_at timestamp
- Research CSV/JSON/model artifacts are not interactive runtime data and do not need to be stored in the database
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

- Database work is for runtime inference history, not bulk research artifact storage
- Prisma legacy schema/config files were removed in MS-13E; runtime persistence is handled by `api-gateway-service` repository code
- SQLite remains the local/demo fallback; PostgreSQL remains optional for deployment through `DATABASE_URL` or `API_GATEWAY_DATABASE_URL`
- Do not migrate CSV/JSON/model research artifacts into the database unless a later milestone explicitly requires it
- Use the existing database boundary/tooling when runtime persistence work is explicitly in scope
- Never run destructive queries without confirmation
- Never create migrations without confirmation
- Never expose database credentials to the client side

> **Why not migrate all artifacts now?** CSV/JSON/model outputs are reproducible thesis artifacts. Keeping them read-only preserves experiment traceability and avoids unnecessary database migration during the microservice boundary milestone.

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
DATABASE_URL=sqlite:///./runtime_inference_history.db
API_GATEWAY_DATABASE_URL=sqlite:///./runtime_inference_history.db
# Optional PostgreSQL Compose profile:
# API_GATEWAY_DATABASE_URL=postgresql://sentirank:sentirank@database-service:5432/sentirank

# App
NEXT_PUBLIC_APP_NAME="SentiRank"

# ML Model Paths — server-only, never expose to client
ML_MODEL_PATH=""
SVM_MODEL_PATH=""
SENTIMENT_MODEL_SOURCE=auto
INDOBERT_MODEL_PATH="ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5"
INDOBERT_MODEL_ID="ahmadzkh/sentirank-indobert-run3"
HF_TOKEN=""
SVM_ASPECT_MODEL_PATH="ml-service/saved_models/svm/svm_merged_5class_pipeline.joblib"
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
- Do not use MongoDB
- Do not migrate research CSV/JSON/model artifacts into the database without an explicit milestone
- Do not run commands that modify or delete production data
- Do not create database migrations without confirmation
- Do not expose database credentials to the client

# Security
- Do not expose API keys or any secret to the client
- Do not bypass user input validation
- Do not skip error handling in API routes
- Do not expose database file paths, connection strings, or credentials publicly
- Do not expose sanitized dataset files outside the server
```

---

_This file defines the rules and context for SentiRank. Keep it updated as the project evolves. The more specific and accurate this file is, the better the results from any AI coding agent._
