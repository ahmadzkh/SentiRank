# Component Map - SentiRank Frontend

## Document Information

| Field | Description |
| --- | --- |
| Project | SentiRank |
| Module | Frontend UI/UX |
| Phase | FE-05 - Component Map |
| Status | Approved |
| Date | 2026-05-30 |
| Visual Direction | SentiRank Research Analytics Light |
| Default Theme | Light Mode |
| Design Source | `frontend/DESIGN.md` |
| Wireframe Source | `docs/frontend/wireframes.md` |
| Development Strategy | Mock-data friendly and API-contract-ready |

---

## 1. Component Principles

SentiRank components must support a clean academic analytics interface:

- Light Mode is the default.
- White cards sit on slate/off-white background.
- Blue is the primary accent for active states and primary actions.
- Tables prioritize readability over density.
- Charts stay minimal and interpretable.
- Components must accept mock data first and map cleanly to future API contracts.
- AHP/Fuzzy AHP components must be flexible, data-driven, and not locked to a final criteria count or final formula UI.

Implementation notes:

- FE-05 defines component contracts only. It does not create React, NextJS, Tailwind, or shadcn/ui implementation code.
- Future implementation should use TypeScript props and explicit domain types.
- shadcn/ui should be treated as a component foundation, not as the final visual identity.
- Tailwind utilities should follow `frontend/DESIGN.md` tokens for color, spacing, radius, typography, and elevation.

---

## 2. Layout Components

| Component | Purpose | Used on which pages | Props/data requirements | Visual rules | Interaction behavior | Empty/loading/error state | Implementation notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `AppShell` | Provides the global dashboard frame. | All authenticated/dashboard pages. | `children`, `sidebarItems`, `activeRoute`, optional `topbarContext`. | Slate/off-white background, fixed sidebar region, white content surfaces. | Keeps sidebar and topbar persistent while route content changes. | Can wrap global loading or route error boundary later. | Implement later as dashboard layout in NextJS App Router route group. |
| `AppSidebar` | Provides primary navigation. | All pages. | `items`, `activeRoute`, optional `collapsed`. | White or very light slate background, blue active item, readable labels. | Navigate between Dashboard, Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification, AHP/Fuzzy AHP, Model Evaluation, Reports, Settings. | Not relevant except route unavailable state may be disabled. | Use route-aware navigation; labels must stay aligned with IA. |
| `AppTopbar` | Shows page context and lightweight actions. | All pages. | `title`, `contextLabel`, `status`, optional `actions`. | White surface, bottom border, compact height, right-aligned actions. | Exposes page-level actions such as export, run mock, or open report. | Show status as loading or not-ready if data context is unavailable. | Use shadcn/ui buttons and status badges later. |
| `PageHeader` | Standardizes page title, description, and primary action. | All pages. | `title`, `description`, optional `primaryAction`, optional `secondaryAction`. | Clear heading, compact description, no hero layout. | Primary and secondary actions trigger page-level workflows. | If page is unavailable, show `NotReadyState` under header. | Keep reusable and small; avoid page-specific logic inside it. |
| `Breadcrumbs` | Shows route context for deeper page sections when needed. | Detail views or future nested pages. | `items`, `currentLabel`. | Small muted text, blue link for clickable ancestors. | Navigate back to parent route or section. | Hide when only one route level exists. | Optional for FE-06+; do not replace sidebar navigation. |

---

## 3. Card Components

| Component | Purpose | Used on which pages | Props/data requirements | Visual rules | Interaction behavior | Empty/loading/error state | Implementation notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `StatCard` | Displays a single metric value with label and trend or note. | Dashboard, Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification, Model Evaluation, Reports, Settings. | `label`, `value`, optional `description`, optional `trend`, optional `status`. | White card, slate border, metric typography, compact text. | Optional click opens related detail page. | Show skeleton for loading, dash for unavailable value. | Generic typed metric component; values may be string or number. |
| `ChartCard` | Frames chart title, chart body, and interpretation. | Dashboard, Dataset, Scraping, Sentiment Analysis, Aspect Classification, Model Evaluation, Reports. | `title`, `description`, `chart`, optional `insight`, optional `actions`. | White card, minimal border, readable labels, no decorative chart chrome. | Optional actions for filters or details. | Empty chart message, loading skeleton, error panel. | Wrap chart library later; keep chart data API explicit. |
| `SummaryCard` | Presents compact narrative summary for a page section. | Dashboard, Dataset, Preprocessing, Reports, Settings. | `title`, `summary`, optional `items`, optional `status`. | White card, small heading, readable body text. | Optional link to supporting page. | Empty summary if upstream data missing. | Useful for thesis-ready explanations. |
| `RankingCard` | Shows ordered aspect or priority ranking. | Dashboard, AHP/Fuzzy AHP, Reports. | `items` with rank, label, score, optional change and interpretation. | White card, clear rank numbers, blue highlight for top item. | Select ranking item to inspect detail. | Empty ranking message if no aspect data. | Must not assume fixed number of criteria/items. |
| `RecommendationCard` | Shows final interpretation or recommended action. | AHP/Fuzzy AHP, Reports, Dashboard preview. | `title`, `recommendation`, `basis`, optional `confidence`, optional `status`. | Slight emphasis card, blue accent border only when primary. | Link to AHP/Fuzzy AHP or Reports evidence. | Not-ready state when prioritization is missing. | Keep recommendation text plain and report-ready. |
| `ModelMetricCard` | Displays ML model metric with context. | Model Evaluation, Dashboard, Reports. | `metricName`, `value`, `dataset`, optional `className`, optional `note`. | Metric prominent, muted context, status badge if needed. | Optional click filters metric detail. | Show unavailable state for missing artifact. | Support accuracy, precision, recall, F1, macro F1, support. |

---

## 4. Table Components

| Component | Purpose | Used on which pages | Props/data requirements | Visual rules | Interaction behavior | Empty/loading/error state | Implementation notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `DataTable` | Generic readable table foundation. | Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification, Model Evaluation, Reports, Settings. | `columns`, `rows`, `rowKey`, optional `pagination`, optional `sorting`, optional `filters`. | Readable row height, sticky header where useful, slate borders. | Sort, filter, paginate, select row. | Standard empty, loading, error rows. | Can map to TanStack Table later without committing in FE-05. |
| `ReviewTable` | Displays review text and related labels. | Dashboard, Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification. | `reviews` with id, text, rating, date, sentiment, aspect, confidence, status. | Text truncation with expand detail, sentiment/aspect badges. | Search, filter by sentiment/aspect/rating, expand text. | Empty review list, loading skeleton, data error. | Review text must not break layout; use typed review shape later. |
| `MatrixTable` | Displays pairwise or confusion matrix data. | AHP/Fuzzy AHP, Model Evaluation. | `rows`, `columns`, `values`, optional `rowLabels`, optional `columnLabels`, optional `editable`. | Large readable cells, sticky labels if needed, horizontal scroll allowed. | Editable cells only in prototype input mode; select cell for detail. | Not-ready if matrix values missing, warning for invalid/incomplete matrix. | Must support dynamic criteria count; no fixed AHP matrix size. |
| `EvaluationTable` | Displays classification report and model metrics. | Model Evaluation, Reports. | `rows` with class label, precision, recall, F1, support, optional note. | Numeric columns right-aligned, weak values visually flagged with labels. | Sort by metric, filter by model or class. | Empty if evaluation artifact missing. | Keep class labels and metric names API-contract-ready. |
| `ComparisonTable` | Compares AHP/Fuzzy AHP or model outputs. | AHP/Fuzzy AHP, Model Evaluation, Reports. | `items`, `comparisonColumns`, optional `baseline`, optional `highlightKey`. | Clear column headers, readable numeric formatting. | Sort and highlight differences. | Empty if only one method/result exists. | Useful for AHP vs Fuzzy AHP and model comparison. |

---

## 5. Chart Components

| Component | Purpose | Used on which pages | Props/data requirements | Visual rules | Interaction behavior | Empty/loading/error state | Implementation notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SentimentDistributionChart` | Shows positive, neutral, and negative distribution. | Dashboard, Sentiment Analysis, Reports. | `data` with sentiment label, count, percentage. | Semantic green/slate/red colors, simple labels. | Hover/selection shows count and percentage. | Empty if no sentiment output. | Keep chart minimal; support mock and API data shape. |
| `AspectRankingChart` | Shows ranked aspects or negative aspect frequency. | Dashboard, Aspect Classification, Reports. | `data` with aspect, count or score, optional sentiment filter. | Horizontal bar chart, blue or semantic highlight for top item. | Select aspect to filter table or detail. | Empty if no aspect labels. | Must not assume fixed aspect list. |
| `ReviewTrendChart` | Shows review or sentiment trend over time/batch. | Dashboard, Dataset, Scraping. | `data` with date or batch, count, optional sentiment split. | Simple line or bar chart, restrained colors. | Hover shows period and count. | Empty if no date or batch data. | Use only when trend data exists; otherwise omit. |
| `ModelMetricChart` | Compares model metrics visually. | Model Evaluation, Dashboard preview, Reports. | `data` with metric, value, model, optional class. | Bar chart with readable labels, no dense monitoring style. | Toggle model or metric group. | Empty if no metrics. | Keep metric definitions aligned with backend evaluation contracts. |
| `AhpRankingComparisonChart` | Compares AHP and Fuzzy AHP ranking outputs. | AHP/Fuzzy AHP, Reports, Dashboard preview. | `data` with aspect, ahpWeight, fuzzyWeight, rank. | Minimal grouped bar or rank comparison, clear legend. | Select aspect to inspect recommendation basis. | Not-ready if either method result missing. | Fuzzy output shape must stay flexible; do not lock final formula fields. |

---

## 6. Badge and Status Components

| Component | Purpose | Used on which pages | Props/data requirements | Visual rules | Interaction behavior | Empty/loading/error state | Implementation notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SentimentBadge` | Displays sentiment label. | Dashboard, Dataset, Sentiment Analysis, Aspect Classification, Reports. | `sentiment` as Positive, Neutral, Negative, or unknown. | Green, slate, red semantic styles with text label. | Optional filter trigger when used in tables. | Unknown maps to neutral muted style. | Never rely on color only. |
| `AspectBadge` | Displays aspect/category label. | Dashboard, Aspect Classification, AHP/Fuzzy AHP, Reports. | `aspect`, optional `variant`, optional `count`. | Compact badge, slate or blue-soft style, readable text. | Optional click filters by aspect. | Missing aspect maps to "Unclassified". | Aspect vocabulary must remain data-driven. |
| `StatusBadge` | Displays generic processing, API, dataset, or model state. | All pages. | `status`, optional `label`, optional `severity`. | Blue for active, green success, amber warning, red error, slate neutral. | Optional tooltip or details link. | Default neutral if status missing. | Reuse for mock status and API readiness. |
| `ConsistencyBadge` | Displays AHP consistency status. | AHP/Fuzzy AHP, Reports. | `ratio`, `threshold`, optional `statusLabel`. | Green for acceptable, amber for warning, red only for blocking invalid state. | Tooltip explains consistency meaning. | Not-ready if ratio unavailable. | Threshold must be prop-driven, not hardcoded in component. |

---

## 7. Form and Input Components

| Component | Purpose | Used on which pages | Props/data requirements | Visual rules | Interaction behavior | Empty/loading/error state | Implementation notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SearchInput` | Provides text search for data-heavy views. | Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification, Reports. | `value`, `placeholder`, `onChange`, optional `debounceMs`. | Standard input height, icon optional, clear focus state. | Debounced search and clear action. | Disabled while data is loading if needed. | Later use shadcn input primitive. |
| `FilterBar` | Groups filters and segmented controls. | Dataset, Scraping, Sentiment Analysis, Aspect Classification, Model Evaluation, Reports. | `filters`, `activeValues`, `onChange`, optional `resetAction`. | Compact horizontal controls on desktop, stack on mobile. | Change filters, reset filters, expose selected count. | Disabled while required data is unavailable. | Keep filter values typed and API-ready. |
| `UploadBox` | Handles dataset import or file placeholder. | Dataset. | `acceptedTypes`, `maxSize`, `status`, optional `onSelect`. | Dashed border, white card, blue accent for active state. | Select or drag file later; mock selection allowed. | Empty prompt, uploading, error for invalid file. | FE-05 defines contract only; no upload implementation. |
| `ReviewInputForm` | Captures single review text for prediction. | Sentiment Analysis. | `value`, `onChange`, `onSubmit`, optional `maxLength`. | Full-width textarea, clear label, primary submit button. | Submit mock prediction, reset text. | Disabled/loading while predicting, error near field. | Input type should be explicit in TypeScript later. |
| `PairwiseComparisonInput` | Captures or previews pairwise judgement values. | AHP/Fuzzy AHP. | `criteria`, `values`, `scaleOptions`, `onChange`, optional `mode`. | Matrix or list layout, readable labels, numeric/select input. | Edit judgement values in prototype mode; validate completeness. | Incomplete warning, invalid value error. | Criteria array is dynamic; no fixed count or fixed formula fields. |
| `CriteriaEditor` | Displays and edits prioritization criteria metadata. | AHP/Fuzzy AHP. | `criteria`, `onAdd`, `onRemove`, `onUpdate`, optional `source`. | Table/list card, clear labels, blue secondary action. | Add/remove/edit criteria in prototype mode. | Empty criteria state links to Aspect Classification. | Must support criteria from mock data or API contract. |

---

## 8. State Components

| Component | Purpose | Used on which pages | Props/data requirements | Visual rules | Interaction behavior | Empty/loading/error state | Implementation notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `LoadingState` | Shows data or section loading. | All pages and data-heavy components. | `label`, optional `variant`, optional `rows`. | Skeleton or compact spinner, no visual noise. | No primary action while loading. | Represents loading state itself. | Should be reusable inside cards, tables, and pages. |
| `EmptyState` | Shows no data available with recovery action. | All pages and table/chart sections. | `title`, `description`, optional `action`. | White card or inline panel, muted text, optional blue action. | Action routes user to required setup page. | Represents empty state itself. | Use for missing dataset, missing analysis, missing report. |
| `ErrorState` | Shows recoverable failure. | All pages and data-heavy components. | `title`, `message`, optional `retryAction`, optional `details`. | Red only for error markers, calm body text, clear action. | Retry, open settings, or inspect details. | Represents error state itself. | Avoid technical stack traces in normal UI. |
| `NotReadyState` | Shows prerequisite not completed. | Sentiment Analysis, Aspect Classification, AHP/Fuzzy AHP, Model Evaluation, Reports. | `requiredStep`, `description`, `actionLabel`, `href`. | Amber or slate informational panel, not an error. | Directs user to prerequisite page. | Represents not-ready state itself. | Useful for mock-first workflow gating. |

---

## 9. Page-specific Composition Components

| Component | Purpose | Used on which pages | Props/data requirements | Visual rules | Interaction behavior | Empty/loading/error state | Implementation notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `DashboardPageComposition` | Composes dashboard overview from metrics, charts, ranking, and review preview. | Dashboard. | `summaryMetrics`, `sentimentDistribution`, `aspectRanking`, `priorityPreview`, `modelPreview`, `latestReviews`. | High-signal first viewport, six stat cards, minimal charts. | Start demo flow, open detail pages. | Uses page-level loading, empty, and error states. | Composition only; use smaller reusable components inside. |
| `DatasetPageComposition` | Composes dataset import, quality, distribution, and review table. | Dataset. | `datasetMeta`, `qualityMetrics`, `ratingDistribution`, `labelDistribution`, `reviews`. | Data inspection first, upload secondary. | Import/select mock dataset, filter/search table. | Empty import prompt, loading import, parsing error. | Keeps dataset data shape aligned with API contracts. |
| `SentimentAnalysisPageComposition` | Composes single prediction and batch sentiment analysis. | Sentiment Analysis. | `predictionInput`, `predictionResult`, `summaryMetrics`, `distribution`, `results`. | Prediction and distribution near top, readable results table. | Run mock prediction, filter and sort results. | Not-ready if preprocessing missing. | Model call remains mock/API later; no logic in component map. |
| `AspectClassificationPageComposition` | Composes aspect frequency, negative grouping, detail, and result table. | Aspect Classification. | `aspectSummary`, `aspectRanking`, `negativeGroups`, `selectedAspect`, `results`. | Aspect scanning and grouped negative reviews prioritized. | Filter by aspect, open aspect detail, continue to AHP/Fuzzy AHP. | Not-ready if sentiment or processed data missing. | Aspect labels must be data-driven. |
| `AhpFuzzyAhpPageComposition` | Composes flexible prioritization workflow. | AHP/Fuzzy AHP. | `criteria`, `pairwiseValues`, `consistency`, `ahpWeights`, `fuzzyWeights`, `ranking`, `recommendation`. | Matrix readability, side-by-side result comparison, explanation card. | Edit prototype judgements, compare rankings, read recommendation. | Empty criteria, incomplete judgement, consistency warning, calculation error. | Dynamic criteria; do not lock final Fuzzy AHP output shape. |
| `ModelEvaluationPageComposition` | Composes metric cards, confusion matrix, classification report, and comparison. | Model Evaluation. | `models`, `selectedModel`, `metrics`, `confusionMatrix`, `classificationReport`, `notes`. | Metrics first, matrix/table readable, weak-class notes visible. | Switch model/task, inspect matrix, compare metrics. | Empty if evaluation artifact missing. | Supports sentiment and aspect model evaluation. |
| `ReportsPageComposition` | Composes thesis-ready summary and export-oriented evidence. | Reports. | `datasetSummary`, `sentimentSummary`, `aspectSummary`, `prioritySummary`, `modelSummary`, `exportStatus`. | Report-readable text panels, summary cards, concise evidence links. | Open supporting pages, export placeholder, copy insight text. | Not-ready if required analysis sections missing. | Keeps report text aligned with demo flow and Bab 4 screenshots. |

---

## 10. Component Relationship Map

```txt
AppShell
- AppSidebar
- AppTopbar
- PageHeader
- Page-specific Composition
  - StatCard / SummaryCard / ChartCard
  - DataTable / ReviewTable / MatrixTable / EvaluationTable
  - Chart Components
  - Badge and Status Components
  - Form and Input Components
  - State Components
```

Shared dependencies:

- Tables use badge components for sentiment, aspect, status, and consistency.
- Page compositions use state components for empty, loading, error, and not-ready cases.
- AHP/Fuzzy AHP composition uses `CriteriaEditor`, `PairwiseComparisonInput`, `MatrixTable`, `ComparisonTable`, `ConsistencyBadge`, `RankingCard`, `AhpRankingComparisonChart`, and `RecommendationCard`.
- Dashboard composition uses summary metrics from all major analysis areas to support skripsi demo flow.

---

## 11. FE-05 Acceptance Criteria

FE-05 is complete when:

- [x] `docs/frontend/component-map.md` exists.
- [x] Layout components are defined.
- [x] Card components are defined.
- [x] Table components are defined.
- [x] Chart components are defined.
- [x] Badge and status components are defined.
- [x] Form and input components are defined.
- [x] State components are defined.
- [x] Page-specific composition components are defined.
- [x] Each component defines purpose.
- [x] Each component defines where it is used.
- [x] Each component defines props or data requirements.
- [x] Each component defines visual rules.
- [x] Each component defines interaction behavior.
- [x] Each component defines empty, loading, or error state guidance where relevant.
- [x] Each component defines implementation notes for NextJS, TypeScript, Tailwind CSS, and shadcn/ui.
- [x] Components align with `SentiRank Research Analytics Light`.
- [x] Components support Light Mode by default.
- [x] Components are mock-data friendly and API-contract-ready.
- [x] AHP/Fuzzy AHP components remain flexible and data-driven.
- [x] No final AHP criteria count is hardcoded.
- [x] Final Fuzzy AHP method output is not locked.
- [x] Tables prioritize readability.
- [x] Charts remain minimal and interpretable.
- [x] No FE-06 or later phase implementation is started.
- [x] No NextJS setup, package install, or implementation code is created.
- [x] `docs/frontend/frontend-tasks.md` is updated after this document is completed.

---

## Completion Note

Completed on 2026-05-30. FE-05 defines reusable frontend component contracts for SentiRank, including layout, cards, tables, charts, badges, forms, states, and page compositions, while keeping AHP/Fuzzy AHP flexible and prototype-ready.
