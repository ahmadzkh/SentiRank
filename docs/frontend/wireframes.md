# Wireframes - SentiRank Frontend

## Document Information

| Field | Description |
| --- | --- |
| Project | SentiRank |
| Module | Frontend UI/UX |
| Phase | FE-04 - Wireframe |
| Status | Approved |
| Date | 2026-05-30 |
| Visual Direction | SentiRank Research Analytics Light |
| Default Theme | Light Mode |
| Layout Direction | Sidebar + topbar + main content |
| Design Style | Clean academic research analytics dashboard |

---

## 1. Wireframe Principles

These wireframes are textual layout specifications for future implementation. They do not create NextJS code, component code, or final method logic.

Global design rules:

- Use Light Mode by default.
- Use slate/off-white page background.
- Use white cards with light slate borders.
- Use blue accent for primary actions and active navigation.
- Use readable tables as primary data inspection surfaces.
- Use minimal charts only where they clarify interpretation.
- Use consistent page structure: header, summary cards, main content, supporting actions.
- Keep the dashboard suitable for skripsi demo flow.

Global app shell:

```txt
App Shell
- Left Sidebar
  - Dashboard
  - Dataset
  - Scraping
  - Preprocessing
  - Sentiment Analysis
  - Aspect Classification
  - AHP / Fuzzy AHP
  - Model Evaluation
  - Reports
  - Settings
- Topbar
  - Current context
  - Dataset/model status
  - Optional page actions
- Main Content
  - Page Header
  - Summary Cards
  - Main Sections
  - Tables / Charts / Forms
  - Notes / Export / Next Actions
```

---

## 2. Dashboard Wireframe

### Page Purpose

Show the complete SentiRank analysis overview for skripsi demo: dataset scale, sentiment distribution, top negative aspects, priority preview, model health, and recent negative reviews.

### Layout Structure

```txt
Dashboard
- Header
- Summary Cards
- Main Analytics Grid
  - Sentiment Distribution
  - Negative Aspect Ranking
  - AHP/Fuzzy AHP Priority Preview
- Data Preview Grid
  - Latest Negative Reviews
  - Model Performance Snapshot
- Demo Flow Shortcuts
```

### Header Section

- Title: `Dashboard`
- Description: short summary of current dataset and latest analysis state.
- Primary action: `Start Demo Flow`
- Secondary action: `Open Reports`

### Summary Cards

- Total Reviews
- Positive Reviews
- Neutral Reviews
- Negative Reviews
- Top Negative Aspect
- Highest Priority Score

### Main Content Sections

- Sentiment distribution overview.
- Negative aspect priority overview.
- AHP/Fuzzy AHP recommendation preview.
- Model performance snapshot.
- Latest negative review samples.

### Table/Chart/Form Sections

- Chart: sentiment distribution using semantic sentiment colors.
- Chart: negative aspect ranking as horizontal bar chart.
- Table: latest negative reviews with sentiment badge, aspect badge, rating, and date.
- No form is required on the dashboard.

### Empty/Loading/Error State Notes

- Empty: show "No analysis data available" with link to Dataset.
- Loading: show skeleton cards and chart placeholders.
- Error: show clear error panel with retry action and link to Settings for API status.

### User Actions

- Start the recommended skripsi demo flow.
- Open Dataset, Sentiment Analysis, Aspect Classification, AHP/Fuzzy AHP, Model Evaluation, or Reports.
- Inspect latest negative reviews.
- Open report summary.

### Data Requirements

- Review totals by sentiment.
- Top aspect and priority score.
- Sentiment distribution.
- Aspect ranking.
- Model metric preview.
- Recent negative review list.

### Responsive Layout Notes

- Desktop: six summary cards in responsive grid, analytics in two-column layout.
- Tablet: summary cards wrap into two columns.
- Mobile: summary cards stack, charts become full width, review table becomes compact list.

---

## 3. Dataset Wireframe

### Page Purpose

Manage and inspect Spotify review data before preprocessing and model analysis.

### Layout Structure

```txt
Dataset
- Header
- Dataset Summary Cards
- Import / Source Panel
- Data Quality Panel
- Distribution Charts
- Review Data Table
```

### Header Section

- Title: `Dataset`
- Description: dataset source, row count, and readiness status.
- Primary action: `Import Dataset`
- Secondary action: `Export Preview`

### Summary Cards

- Total Rows
- Unique Reviews
- Duplicate Rows
- Missing Values
- Date Range
- Label Coverage

### Main Content Sections

- Dataset source and import status.
- Data quality summary.
- Rating distribution.
- Label distribution.
- Review explorer table.

### Table/Chart/Form Sections

- Form: dataset import or mock dataset selector.
- Chart: rating distribution.
- Chart: sentiment label distribution when labels exist.
- Table: review text, rating, date, source, label, status.

### Empty/Loading/Error State Notes

- Empty: show import prompt and mock dataset option.
- Loading: show import progress and table skeleton.
- Error: show file format or data parsing issue with actionable message.

### User Actions

- Import or select mock dataset.
- Search review text.
- Filter by rating, label, date, or status.
- Inspect duplicate or missing records.
- Export dataset preview.

### Data Requirements

- Dataset metadata.
- Review rows.
- Rating values.
- Optional sentiment labels.
- Duplicate and missing value counts.
- Import status.

### Responsive Layout Notes

- Desktop: data quality and distribution panels can sit side by side.
- Tablet: charts stack above table.
- Mobile: table becomes searchable list with expandable review text.

---

## 4. Scraping Wireframe

### Page Purpose

Show raw Spotify review collection status and scraping batch results without making scraping the main analysis result.

### Layout Structure

```txt
Scraping
- Header
- Scraping Status Cards
- Scraping Parameter Panel
- Batch Summary
- Rating Group Distribution
- Raw Scraping Result Table
```

### Header Section

- Title: `Scraping`
- Description: latest scraping batch status and collection summary.
- Primary action: `Run Mock Scraping`
- Secondary action: `Export Raw Data`

### Summary Cards

- Requested Reviews
- Collected Reviews
- Failed Items
- Latest Batch Date
- Source Package / App
- Batch Status

### Main Content Sections

- Scraping parameter overview.
- Latest batch status.
- Rating group distribution.
- Raw review preview.

### Table/Chart/Form Sections

- Form: package/app identifier, rating filter, language/region placeholder, max review count.
- Chart: rating group distribution.
- Table: raw review text, rating, date, username placeholder, batch id, status.

### Empty/Loading/Error State Notes

- Empty: show no scraping batch yet and recommend Dataset import as alternative.
- Loading: show progress status by requested and collected counts.
- Error: show source access, network, or parsing issue placeholder.

### User Actions

- Configure mock scraping parameters.
- Start mock scraping preview.
- Inspect batch status.
- Filter raw results by rating or status.
- Export raw dataset preview.

### Data Requirements

- Scraping configuration.
- Batch metadata.
- Raw review rows.
- Rating distribution.
- Batch progress status.

### Responsive Layout Notes

- Desktop: parameters and batch summary can sit in two columns.
- Tablet: parameter form stacks above charts.
- Mobile: raw review table becomes compact cards.

---

## 5. Preprocessing Wireframe

### Page Purpose

Explain and inspect text cleaning before sentiment and aspect modeling.

### Layout Structure

```txt
Preprocessing
- Header
- Process Summary Cards
- Pipeline Steps
- Before / After Text Comparison
- Token / Noise Summary
- Processed Review Table
```

### Header Section

- Title: `Preprocessing`
- Description: cleaning pipeline status and processed dataset readiness.
- Primary action: `Run Mock Preprocessing`
- Secondary action: `Open Sentiment Analysis`

### Summary Cards

- Raw Reviews
- Processed Reviews
- Removed Duplicates
- Cleaned Tokens
- Empty After Cleaning
- Pipeline Status

### Main Content Sections

- Pipeline step overview.
- Raw versus cleaned text comparison.
- Token or word frequency summary.
- Processed dataset table.

### Table/Chart/Form Sections

- Step list: normalization, cleaning, tokenization, stopword removal, stemming placeholder if used.
- Comparison table: raw text and processed text.
- Chart: optional token frequency bar chart.
- Table: review id, raw text snippet, clean text snippet, status.

### Empty/Loading/Error State Notes

- Empty: show no dataset selected and link to Dataset.
- Loading: show pipeline step progress.
- Error: show failed preprocessing step and affected row count.

### User Actions

- Run mock preprocessing.
- Compare raw and cleaned text.
- Filter processed rows by status.
- Open Dataset or Sentiment Analysis.
- Inspect pipeline explanation.

### Data Requirements

- Raw review text.
- Processed review text.
- Pipeline step status.
- Removed character or token summary.
- Processed dataset rows.

### Responsive Layout Notes

- Desktop: before/after comparison uses two-column text panels.
- Tablet: comparison panels stack.
- Mobile: use expandable rows for long text.

---

## 6. Sentiment Analysis Wireframe

### Page Purpose

Display IndoBERT sentiment output for single review testing and batch dataset analysis.

### Layout Structure

```txt
Sentiment Analysis
- Header
- Sentiment Summary Cards
- Single Review Prediction Panel
- Batch Sentiment Distribution
- Confidence Summary
- Sentiment Result Table
```

### Header Section

- Title: `Sentiment Analysis`
- Description: sentiment prediction output and confidence overview.
- Primary action: `Run Mock Prediction`
- Secondary action: `Open Aspect Classification`

### Summary Cards

- Positive Reviews
- Neutral Reviews
- Negative Reviews
- Average Confidence
- Latest Model Version
- Batch Status

### Main Content Sections

- Single review prediction.
- Batch sentiment distribution.
- Confidence score overview.
- Sentiment result table.

### Table/Chart/Form Sections

- Form: textarea for single review input.
- Result card: predicted label, confidence, and explanation.
- Chart: sentiment distribution.
- Table: review text, sentiment badge, confidence, rating, date.

### Empty/Loading/Error State Notes

- Empty: show no processed dataset and link to Preprocessing.
- Loading: show prediction and batch analysis skeletons.
- Error: show model unavailable or prediction failure message.

### User Actions

- Enter single review text.
- Run mock prediction.
- Filter result table by sentiment.
- Sort by confidence.
- Open Aspect Classification for next demo step.

### Data Requirements

- Processed review text.
- Sentiment labels.
- Confidence scores.
- Model metadata.
- Batch analysis status.

### Responsive Layout Notes

- Desktop: prediction panel and distribution chart can sit side by side.
- Tablet: chart stacks under prediction panel.
- Mobile: textarea remains full width and result table becomes compact list.

---

## 7. Aspect Classification Wireframe

### Page Purpose

Display SVM aspect classification output and summarize negative review themes.

### Layout Structure

```txt
Aspect Classification
- Header
- Aspect Summary Cards
- Aspect Frequency Chart
- Negative Review Grouping
- Aspect Detail Panel
- Aspect Result Table
```

### Header Section

- Title: `Aspect Classification`
- Description: aspect labels and negative review grouping.
- Primary action: `Run Mock Classification`
- Secondary action: `Open AHP / Fuzzy AHP`

### Summary Cards

- Total Classified Reviews
- Dominant Aspect
- Negative Aspect Count
- Multi-aspect Reviews
- Average Confidence
- Classifier Status

### Main Content Sections

- Aspect frequency overview.
- Negative review grouping by aspect.
- Aspect detail panel.
- Aspect classification table.

### Table/Chart/Form Sections

- Chart: aspect frequency bar chart.
- Grouped list: negative reviews by aspect.
- Detail panel: selected aspect description and sample reviews.
- Table: review text, aspect badge, sentiment badge, confidence, status.

### Empty/Loading/Error State Notes

- Empty: show no sentiment/classification data and link to Sentiment Analysis.
- Loading: show classification progress and placeholder rows.
- Error: show classifier unavailable or missing feature data.

### User Actions

- Run mock aspect classification.
- Filter by aspect.
- Inspect negative review groups.
- Open selected aspect detail.
- Continue to AHP / Fuzzy AHP.

### Data Requirements

- Review text.
- Aspect labels.
- Sentiment labels.
- Confidence or evidence field if available.
- Aspect counts.
- Negative review groupings.

### Responsive Layout Notes

- Desktop: chart and aspect detail can sit side by side.
- Tablet: grouping list stacks above table.
- Mobile: aspect groups become accordion sections.

---

## 8. AHP / Fuzzy AHP Wireframe

### Page Purpose

Provide a flexible, prototype-ready interface for prioritizing negative aspects using AHP and Fuzzy AHP without locking final criteria count or final formula UI.

### Layout Structure

```txt
AHP / Fuzzy AHP
- Header
- Method Status Cards
- Criteria Setup Panel
- Expert Judgement / Pairwise Input
- Pairwise Matrix Preview
- Consistency Result
- AHP Weight Result
- Fuzzy AHP Prototype Result
- Ranking Comparison
- Final Recommendation Summary
```

### Header Section

- Title: `AHP / Fuzzy AHP`
- Description: data-driven prioritization workflow for negative aspects.
- Primary action: `Run Mock Prioritization`
- Secondary action: `Open Reports`

### Summary Cards

- Criteria Count
- Judgement Completion
- Consistency Ratio
- Top Priority Aspect
- AHP Ranking Status
- Fuzzy AHP Prototype Status

### Main Content Sections

- Criteria setup with dynamic criteria list.
- Pairwise comparison input or preview.
- Consistency ratio and warning explanation.
- AHP weight result.
- Fuzzy AHP prototype result.
- Ranking comparison and final recommendation.

### Table/Chart/Form Sections

- Form/table: dynamic criteria list sourced from aspect data.
- Matrix table: pairwise comparison preview with readable cells.
- Result table: AHP weights by aspect.
- Result table: Fuzzy AHP prototype weights by aspect.
- Chart: ranking comparison only if it improves clarity.
- Explanation panel: method interpretation and recommendation.

### Empty/Loading/Error State Notes

- Empty: show no negative aspect data and link to Aspect Classification.
- Loading: show calculation/prototype progress by section.
- Error: show missing criteria, incomplete judgement, invalid matrix, or consistency issue.
- Warning: use amber for consistency warning or incomplete judgement.

### User Actions

- Review dynamic criteria list.
- Inspect or edit pairwise judgement values in prototype mode.
- Review consistency ratio.
- Compare AHP and Fuzzy AHP ranking outputs.
- Read final recommendation.
- Continue to Reports.

### Data Requirements

- Negative aspect list from classification output.
- Dynamic criteria metadata.
- Pairwise comparison values.
- Consistency ratio.
- AHP weights.
- Fuzzy AHP prototype weights.
- Ranking comparison data.
- Recommendation text.

### Responsive Layout Notes

- Desktop: matrix uses horizontal space and may scroll inside its section.
- Tablet: matrix remains full width with sticky labels if implemented later.
- Mobile: matrix should use a simplified stacked comparison list, not tiny cells.

### Flexibility Constraints

- Do not hardcode final AHP criteria count.
- Do not assume final Fuzzy AHP formula UI is locked.
- Treat this page as prototype-ready until methodology is finalized.
- Keep exact method calculation in backend/service unless a later phase explicitly changes that decision.

---

## 9. Model Evaluation Wireframe

### Page Purpose

Show evidence for model performance across sentiment analysis and aspect classification.

### Layout Structure

```txt
Model Evaluation
- Header
- Model Metric Cards
- Model Selector / Tabs
- Confusion Matrix Section
- Classification Report Table
- Model Comparison Section
- Evaluation Notes
```

### Header Section

- Title: `Model Evaluation`
- Description: model quality evidence for thesis evaluation.
- Primary action: `Compare Models`
- Secondary action: `Open Reports`

### Summary Cards

- Accuracy
- Precision
- Recall
- F1 Score
- Macro F1
- Evaluated Samples

### Main Content Sections

- Sentiment model metrics.
- Aspect classifier metrics.
- Confusion matrix.
- Classification report.
- Model comparison notes.

### Table/Chart/Form Sections

- Tabs or segmented control: Sentiment Model and Aspect Model.
- Chart/table: confusion matrix.
- Table: class-level precision, recall, F1, support.
- Chart: optional metric comparison bar chart.
- Notes panel: interpretation and weak-class observations.

### Empty/Loading/Error State Notes

- Empty: show no evaluation result and link to Sentiment Analysis or Aspect Classification.
- Loading: show metric card and table skeletons.
- Error: show missing evaluation artifact or incompatible metric data.

### User Actions

- Switch between sentiment and aspect model evaluation.
- Inspect confusion matrix.
- Read classification report.
- Compare model metrics.
- Open Reports.

### Data Requirements

- Model name and version.
- Accuracy, precision, recall, F1, macro F1.
- Confusion matrix values.
- Class-level metrics.
- Evaluation sample count.
- Evaluation notes.

### Responsive Layout Notes

- Desktop: metric cards in grid and matrix/report side by side if space allows.
- Tablet: matrix above report table.
- Mobile: confusion matrix may require horizontal scroll.

---

## 10. Reports Wireframe

### Page Purpose

Present a thesis-ready summary of dataset, sentiment, aspect, prioritization, and model evaluation results.

### Layout Structure

```txt
Reports
- Header
- Report Summary Cards
- Research Summary Sections
- Recommendation Summary
- Supporting Evidence Links
- Export Actions
```

### Header Section

- Title: `Reports`
- Description: final summary for skripsi demo and documentation.
- Primary action: `Export PDF`
- Secondary action: `Export Excel`

### Summary Cards

- Dataset Size
- Negative Review Share
- Top Negative Aspect
- Final Priority Aspect
- Model Macro F1
- Report Status

### Main Content Sections

- Dataset summary.
- Sentiment analysis summary.
- Aspect classification summary.
- AHP/Fuzzy AHP recommendation summary.
- Model evaluation summary.
- Research notes.

### Table/Chart/Form Sections

- Summary table: key metrics and values.
- Chart: optional final ranking comparison.
- Text panels: report-ready interpretation.
- Export action panel.

### Empty/Loading/Error State Notes

- Empty: show missing analysis sections and direct links to required pages.
- Loading: show report generation placeholder.
- Error: show which report section failed to load.

### User Actions

- Review final research narrative.
- Open supporting detail pages.
- Export PDF or Excel placeholder.
- Copy report-ready insight text.
- Return to Dashboard.

### Data Requirements

- Dataset summary metrics.
- Sentiment distribution.
- Aspect ranking.
- AHP/Fuzzy AHP final recommendation.
- Model evaluation metrics.
- Export status.

### Responsive Layout Notes

- Desktop: summary and evidence sections use readable report layout.
- Tablet: sections stack with clear headings.
- Mobile: export actions remain visible after summary.

---

## 11. Settings Wireframe

### Page Purpose

Show application configuration, API readiness placeholders, model metadata, and system information.

### Layout Structure

```txt
Settings
- Header
- System Status Cards
- Application Settings
- API Configuration Preview
- Model Metadata
- Theme Preference
```

### Header Section

- Title: `Settings`
- Description: application metadata and future integration configuration.
- Primary action: `Save Settings`
- Secondary action: `Test API Placeholder`

### Summary Cards

- App Version
- API Status
- Dataset Status
- Sentiment Model Status
- Aspect Model Status
- Theme

### Main Content Sections

- Application metadata.
- API endpoint placeholders.
- Model metadata.
- Theme preference.
- System status notes.

### Table/Chart/Form Sections

- Form: API base URL placeholder and environment label.
- Form: theme preference locked to Light Mode default for initial phase.
- Table: model metadata with name, version, task, and status.
- No chart is required.

### Empty/Loading/Error State Notes

- Empty: show default configuration placeholders.
- Loading: show settings skeleton.
- Error: show failed configuration read or invalid endpoint placeholder.

### User Actions

- Review configuration placeholders.
- Inspect model metadata.
- Confirm Light Mode default.
- Test API placeholder in future implementation.
- Save settings in future implementation.

### Data Requirements

- App metadata.
- API endpoint placeholder.
- Environment label.
- Model metadata.
- Theme preference.
- System status.

### Responsive Layout Notes

- Desktop: settings sections can use two-column form layout.
- Tablet: panels stack.
- Mobile: each settings group becomes full-width section.

---

## 12. FE-04 Acceptance Criteria

FE-04 is complete when:

- [x] `docs/frontend/wireframes.md` exists.
- [x] Dashboard wireframe is defined.
- [x] Dataset wireframe is defined.
- [x] Scraping wireframe is defined.
- [x] Preprocessing wireframe is defined.
- [x] Sentiment Analysis wireframe is defined.
- [x] Aspect Classification wireframe is defined.
- [x] AHP / Fuzzy AHP wireframe is defined.
- [x] Model Evaluation wireframe is defined.
- [x] Reports wireframe is defined.
- [x] Settings wireframe is defined.
- [x] Each page includes purpose, layout, header, summary cards, main content, table/chart/form sections, states, actions, data requirements, and responsive notes.
- [x] Dashboard supports skripsi demo flow.
- [x] AHP/Fuzzy AHP remains flexible, data-driven, and prototype-ready.
- [x] No final AHP criteria count is hardcoded.
- [x] Final Fuzzy AHP formula UI is not locked.
- [x] Wireframes follow SentiRank Research Analytics Light, Light Mode, sidebar/topbar/main layout, white cards, slate/off-white background, blue accent, readable tables, and minimal charts.
- [x] No FE-05 or later phase implementation is started.
- [x] No NextJS setup, package install, or implementation code is created.
- [x] `docs/frontend/frontend-tasks.md` is updated after this document is completed.

---

## Completion Note

Completed on 2026-05-30. FE-04 defines textual wireframes for the 10 main SentiRank frontend pages and keeps the design aligned with `SentiRank Research Analytics Light`, the FE-02 information architecture, and `frontend/DESIGN.md`.
