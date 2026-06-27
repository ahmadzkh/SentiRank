# Information Architecture - SentiRank Frontend

## Document Information

| Field | Description |
| --- | --- |
| Project | SentiRank |
| Module | Frontend UI/UX |
| Phase | FE-02 - Information Architecture |
| Status | Approved |
| Date | 2026-05-30 |
| Default Theme | Light Mode |
| Visual Direction | SentiRank Research Analytics Light |
| Frontend Approach | Dashboard-based analytics application |
| Stack Direction | NextJS App Router, TypeScript, Tailwind CSS, shadcn/ui |
| Development Strategy | Mock-first and API-contract-ready |

---

## 1. Application Purpose

SentiRank is a research analytics dashboard for Spotify review sentiment analysis and insight prioritization. The frontend must help users move from raw review data to interpretable research output:

- collect or import Spotify review data;
- inspect dataset quality and label distribution;
- review preprocessing results;
- analyze sentiment with IndoBERT;
- classify review aspects with SVM;
- prioritize negative aspects using AHP and Fuzzy AHP;
- evaluate model performance;
- prepare report-ready summaries for skripsi documentation and demo.

The application is not a landing page. It is an operational analytics interface with a clear dashboard shell, Light Mode default, readable tables, simple charts, and page flows that support academic demonstration.

---

## 2. Target Users

| User | Need | IA Implication |
| --- | --- | --- |
| Researcher / student | Run and explain the analysis workflow end to end. | Main navigation must follow the research pipeline from data to report. |
| Thesis supervisor / examiner | Understand method, output, and evidence quickly during demo. | Dashboard, model evaluation, and reports must be easy to scan. |
| Developer / maintainer | Connect frontend to FastAPI and ML service contracts later. | Routes and page data must be API-contract-ready and mock-friendly. |
| Non-technical evaluator | Read high-level findings without inspecting implementation details. | Reports and dashboard summaries must explain results plainly. |

---

## 3. Main Navigation Structure

Primary navigation uses a left sidebar inside a dashboard app shell.

| Order | Navigation Item | Route | Role |
| --- | --- | --- | --- |
| 1 | Dashboard | `/` | Overview of latest dataset, sentiment, aspects, priority ranking, and model health. |
| 2 | Dataset | `/dataset` | Dataset import, quality summary, distribution, and review explorer. |
| 3 | Preprocessing | `/preprocessing` | Text cleaning pipeline and before/after review samples. |
| 4 | Sentiment Analysis | `/sentiment-analysis` | IndoBERT sentiment prediction results, distribution, and runtime inference. |
| 5 | Aspect Classification | `/aspect-classification` | SVM aspect classification results and aspect frequency. |
| 6 | AHP / Fuzzy AHP | `/ahp-fuzzy-ahp` | Criteria weighting, matrix review, consistency, and ranking output. |
| 7 | Model Evaluation | `/model-evaluation` | Sentiment and aspect model metrics. |
| 8 | Settings | `/settings` | Application metadata, API configuration preview, and system settings. |

Secondary navigation should be page-local only, such as tabs or filters inside a page. The main sidebar remains stable across all routes.

---

## 4. Page Hierarchy

```txt
App Shell
- Sidebar Navigation
- Topbar
- Main Content
  - Dashboard
  - Dataset
  - Preprocessing
  - Sentiment Analysis
  - Aspect Classification
  - AHP / Fuzzy AHP
  - Model Evaluation
  - Settings
```

Each page follows the same information pattern:

```txt
Page Header
- Title
- Short description
- Optional primary action

Summary Section
- Stat cards
- Key metrics

Main Content
- Chart, table, form, matrix, or result panels

Supporting Content
- Notes, interpretation, export, or next-step guidance
```

---

## 5. Route Plan for NextJS App Router

Planned route structure for FE-06 implementation:

| Route | Planned File | Page |
| --- | --- | --- |
| `/` | `frontend/app/(dashboard)/page.tsx` | Dashboard |
| `/dataset` | `frontend/app/(dashboard)/dataset/page.tsx` | Dataset |
| `/preprocessing` | `frontend/app/(dashboard)/preprocessing/page.tsx` | Preprocessing |
| `/sentiment-analysis` | `frontend/app/(dashboard)/sentiment-analysis/page.tsx` | Sentiment Analysis |
| `/aspect-classification` | `frontend/app/(dashboard)/aspect-classification/page.tsx` | Aspect Classification |
| `/ahp-fuzzy-ahp` | `frontend/app/(dashboard)/ahp-fuzzy-ahp/page.tsx` | AHP / Fuzzy AHP |
| `/model-evaluation` | `frontend/app/(dashboard)/model-evaluation/page.tsx` | Model Evaluation |
| `/settings` | `frontend/app/(dashboard)/settings/page.tsx` | Settings |

Shared layout plan:

| Planned File | Responsibility |
| --- | --- |
| `frontend/app/layout.tsx` | Root HTML shell and global providers. |
| `frontend/app/(dashboard)/layout.tsx` | Dashboard shell with sidebar, topbar, and main content container. |
| `frontend/components/layout/AppSidebar.tsx` | Main navigation list and active route state. |
| `frontend/components/layout/AppTopbar.tsx` | Page-level context, status, and secondary actions. |
| `frontend/components/layout/PageHeader.tsx` | Reusable page title, description, and primary action area. |

This is a route plan only. FE-02 does not implement NextJS files.

---

## 6. Page-by-page Purpose

| Page | Purpose |
| --- | --- |
| Dashboard | Provide a quick overview of the current analysis state and the most important findings. |
| Dataset | Manage and inspect review data before analysis. |
| Preprocessing | Explain and inspect text cleaning results before modeling. |
| Sentiment Analysis | Display IndoBERT sentiment outputs and runtime inference history. |
| Aspect Classification | Display aspect labels from SVM and summarize negative review themes. |
| AHP / Fuzzy AHP | Show prioritization inputs, matrices, weights, consistency, and final ranking. |
| Model Evaluation | Show model performance evidence for sentiment and aspect classifiers. |
| Settings | Hold app configuration, API readiness, model metadata, and system information. |

---

## 7. Data Shown on Each Page

| Page | Data Shown |
| --- | --- |
| Dashboard | Total reviews, sentiment counts, top negative aspect, priority score, sentiment distribution, aspect ranking, model performance preview, latest negative reviews. |
| Dataset | Dataset source, import status, total rows, duplicate count, missing value count, rating distribution, label distribution, review table. |
| Preprocessing | Pipeline steps, raw text sample, cleaned text sample, token summary, removed noise examples, processed dataset table. |
| Sentiment Analysis | Batch sentiment counts, sentiment chart, sentiment result table, single review runtime inference form, runtime inference history. |
| Aspect Classification | Aspect counts, negative review grouping, aspect frequency chart, confidence or rule evidence if available, aspect result table. |
| AHP / Fuzzy AHP | Criteria list, pairwise comparison matrix, consistency ratio, AHP weights, Fuzzy AHP weights, ranking comparison, final recommendation. |
| Model Evaluation | Accuracy, precision, recall, F1 score, macro F1, confusion matrix, classification report, model version, evaluation notes. |
| Settings | App metadata, API endpoint placeholders, model metadata, theme preference, system status, environment notes. |

---

## 8. User Actions on Each Page

| Page | User Actions |
| --- | --- |
| Dashboard | Open detail pages, inspect top findings, review latest negative feedback, start demo flow. |
| Dataset | Upload or select mock dataset, search reviews, filter rows, inspect data quality, export preview. |
| Scraping | Configure mock scraping parameters, inspect batch status, export raw data preview. |
| Preprocessing | Compare raw and cleaned text, filter processed rows, inspect pipeline step explanations. |
| Sentiment Analysis | Enter single review text, run mock prediction, filter sentiment table, inspect confidence. |
| Aspect Classification | Filter by aspect, inspect negative review groups, open aspect detail, compare aspect counts. |
| AHP / Fuzzy AHP | Review criteria, inspect pairwise matrix, compare AHP and Fuzzy AHP ranking, read final recommendation. |
| Model Evaluation | Switch model metric panels, inspect confusion matrix, compare sentiment and aspect model results. |
| Reports | Review final summary, prepare export output, copy report-ready insight text, open supporting pages. |
| Settings | Review API configuration placeholders, inspect model metadata, confirm Light Mode default. |

Actions are planned for mock-first UI. Real API calls are introduced later after API contract preparation.

---

## 9. Relationship Between Pages

```txt
Scraping -> Dataset
Dataset -> Preprocessing
Preprocessing -> Sentiment Analysis
Preprocessing -> Aspect Classification
Sentiment Analysis -> AHP / Fuzzy AHP
Aspect Classification -> AHP / Fuzzy AHP
Sentiment Analysis -> Model Evaluation
Aspect Classification -> Model Evaluation
AHP / Fuzzy AHP -> Reports
Model Evaluation -> Reports
All analysis pages -> Dashboard summary
Settings -> All pages that later need API or model metadata
```

Interpretation:

- Scraping can produce raw review data, but Dataset remains the main source view.
- Preprocessing is the bridge between raw data and ML outputs.
- Sentiment Analysis identifies polarity; Aspect Classification explains topic/category.
- AHP / Fuzzy AHP uses negative aspect evidence to produce prioritization.
- Model Evaluation provides credibility for model outputs.
- Reports aggregates the research-ready narrative.
- Dashboard summarizes the whole system without replacing detail pages.

---

## 10. Recommended User Flow for Demo Skripsi

Use this flow when demonstrating SentiRank to a supervisor or examiner:

1. Open Dashboard to show the system overview and final insight preview.
2. Open Dataset to show the Spotify review data source and quality summary.
3. Open Scraping if the evaluator asks how raw review data is collected.
4. Open Preprocessing to explain text cleaning before modeling.
5. Open Sentiment Analysis to show IndoBERT sentiment output.
6. Open Aspect Classification to show SVM aspect labels.
7. Open AHP / Fuzzy AHP to show prioritization of negative aspects.
8. Open Model Evaluation to show that model performance is measured.
9. Open Reports to present the final research summary and recommendation.
10. Open Settings only if API, model metadata, or environment configuration is questioned.

Recommended default demo path:

```txt
Dashboard -> Dataset -> Preprocessing -> Sentiment Analysis -> Aspect Classification -> AHP / Fuzzy AHP -> Model Evaluation -> Reports
```

---

## 11. FE-02 Acceptance Criteria

FE-02 is complete when:

- [x] `docs/frontend/information-architecture.md` exists.
- [x] Application purpose is defined.
- [x] Target users are defined.
- [x] Main navigation structure is defined.
- [x] Page hierarchy is defined.
- [x] NextJS App Router route plan is defined.
- [x] Page-by-page purpose is defined.
- [x] Data shown on each page is defined.
- [x] User actions on each page are defined.
- [x] Relationship between pages is defined.
- [x] Recommended demo flow for skripsi is defined.
- [x] FE-02 remains aligned with `SentiRank Research Analytics Light`.
- [x] FE-02 remains Light Mode by default.
- [x] FE-02 remains mock-first and API-contract-ready.
- [x] No FE-03 or later phase implementation is started.
- [x] `docs/frontend/frontend-tasks.md` is updated after this document is completed.

---

## Completion Note

Completed on 2026-05-30. FE-02 defines the frontend information architecture, route plan, page hierarchy, page responsibilities, data visibility, user actions, inter-page relationships, and recommended skripsi demo flow. This document is ready to be used as input for FE-03 when that phase starts.
