# SentiRank Frontend Design Specification

## Document Information

| Field | Value |
| --- | --- |
| Project | SentiRank |
| Document | Canonical Frontend Design Specification |
| Phase | FE-03 - DESIGN.md |
| Status | Approved |
| Date | 2026-05-30 |
| Visual Direction | SentiRank Research Analytics Light |
| Default Theme | Light Mode |
| Product Type | Dashboard-based research analytics application |
| Stack Direction | NextJS, TypeScript, Tailwind CSS, shadcn/ui |

---

## 1. Product Identity

SentiRank is a thesis-focused research analytics dashboard for Spotify review sentiment analysis and insight prioritization. The interface must support the research workflow from review data to sentiment output, aspect classification, AHP/Fuzzy AHP prioritization, model evaluation, and report-ready interpretation.

Design identity:

```txt
SentiRank Research Analytics Light
```

SentiRank should feel clean, academic, analytical, professional, readable, and credible. It must look like a serious analytics application, not a marketing site, e-commerce interface, cyberpunk dashboard, or decorative visual experiment.

---

## 2. Design Goals

- Make research data easy to inspect, compare, and explain.
- Prioritize readable tables, clear metrics, and simple visualizations.
- Support thesis screenshots and live demo presentation.
- Keep navigation predictable across the full analysis workflow.
- Make AHP/Fuzzy AHP outputs understandable, not only numeric.
- Historical FE mock data remains available for design reference, but gateway-backed demo pages must use API Gateway data or explicit zero/empty states.
- Use a restrained SaaS analytics style with white surfaces, slate/off-white background, and blue accent.

---

## 3. Visual Principles

- Data first: charts, tables, metrics, and explanations must be clearer than decoration.
- Light by default: all core screens use Light Mode as the baseline.
- Academic clarity: visual style must help supervisors and examiners understand the system quickly.
- Consistent structure: each page uses page header, summary section, main content, and supporting notes.
- Minimal emphasis: use color only to communicate action, category, sentiment, status, or priority.
- Professional restraint: avoid oversized hero sections, glow effects, decorative gradients, and dense monitoring UI.
- Implementation realism: rules must be practical for NextJS, Tailwind CSS, and shadcn/ui.

---

## 4. Default Theme

Light Mode is the default and canonical theme.

Reasons:

- Better readability for tables, matrices, and reports.
- Safer for thesis screenshots and presentation slides.
- More neutral for academic and decision-support use.
- Easier to scan for non-technical evaluators.

Dark Mode is not part of the initial design scope. If added later, it must preserve the same hierarchy and semantic color meaning.

---

## 5. Color Tokens

Use slate/off-white backgrounds, white cards, and blue as the primary accent.

| Token | Value | Usage |
| --- | --- | --- |
| `background` | `slate-50` | App background. |
| `surface` | `white` | Cards, panels, table containers. |
| `surface-muted` | `slate-100` | Subtle section background or inactive controls. |
| `border` | `slate-200` | Card, table, input, and divider border. |
| `border-strong` | `slate-300` | Active table border or selected state. |
| `text-primary` | `slate-950` | Main headings and important values. |
| `text-secondary` | `slate-700` | Body text and section descriptions. |
| `text-muted` | `slate-500` | Helper text and metadata. |
| `text-inverse` | `white` | Text on solid primary buttons. |
| `primary` | `blue-600` | Primary actions, active nav, selected states. |
| `primary-hover` | `blue-700` | Primary button hover. |
| `primary-soft` | `blue-50` | Active nav background or subtle highlight. |
| `positive` | `green-600` | Positive sentiment or success state. |
| `positive-soft` | `green-50` | Positive badge background. |
| `neutral` | `slate-500` | Neutral sentiment or inactive state. |
| `neutral-soft` | `slate-100` | Neutral badge background. |
| `negative` | `red-600` | Negative sentiment or destructive state. |
| `negative-soft` | `red-50` | Negative badge background. |
| `warning` | `amber-600` | Warning, consistency warning, partial state. |
| `warning-soft` | `amber-50` | Warning badge background. |

Color rules:

- Blue is reserved for primary actions, selected navigation, links, and important highlights.
- Red is reserved for negative sentiment, errors, and destructive actions.
- Green is reserved for positive sentiment and successful states.
- Amber is reserved for warnings, including AHP consistency warnings.
- Do not use color alone to communicate status; pair it with text labels.

---

## 6. Typography Tokens

Preferred typeface:

```txt
Inter
```

Fallback stack:

```txt
Inter, Geist, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

| Token | Size | Weight | Line Height | Usage |
| --- | --- | --- | --- | --- |
| `display-sm` | `30px` | `700` | `36px` | Rare page-level emphasis only. |
| `heading-lg` | `24px` | `700` | `32px` | Main page title. |
| `heading-md` | `20px` | `650` | `28px` | Section title. |
| `heading-sm` | `16px` | `650` | `24px` | Card title. |
| `body-md` | `14px` | `400` | `22px` | Default body and table text. |
| `body-sm` | `13px` | `400` | `20px` | Helper text and metadata. |
| `label` | `12px` | `600` | `16px` | Form label, badge, table header. |
| `metric` | `28px` | `700` | `34px` | Stat card value. |

Typography rules:

- Do not scale font size with viewport width.
- Letter spacing stays `0`.
- Use short, explicit headings.
- Metric numbers may be larger, but card labels remain compact.
- Avoid decorative fonts.

---

## 7. Spacing Tokens

Use an 8px spacing base.

| Token | Value | Usage |
| --- | --- | --- |
| `space-1` | `4px` | Tight icon/text gap. |
| `space-2` | `8px` | Small gaps and compact padding. |
| `space-3` | `12px` | Form field gaps. |
| `space-4` | `16px` | Card padding on compact elements. |
| `space-5` | `20px` | Default section spacing. |
| `space-6` | `24px` | Page content gaps. |
| `space-8` | `32px` | Large section separation. |
| `space-10` | `40px` | Rare major page separation. |

Rules:

- Page content uses `24px` to `32px` outer padding on desktop.
- Cards use `16px` to `24px` internal padding.
- Tables need enough row height for review text readability.
- Avoid cramped panels and overly dense dashboards.

---

## 8. Border Radius Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `radius-sm` | `4px` | Badges, small controls. |
| `radius-md` | `6px` | Inputs, buttons, table rows. |
| `radius-lg` | `8px` | Cards, panels, dialogs. |

Rules:

- Cards should use `8px` radius or less.
- Do not use pill shapes unless the component is a badge.
- Keep table and form controls visually aligned with card radius.

---

## 9. Shadow and Elevation Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `shadow-none` | `none` | Tables and flat sections. |
| `shadow-sm` | `0 1px 2px rgb(15 23 42 / 0.06)` | Default card depth. |
| `shadow-md` | `0 8px 24px rgb(15 23 42 / 0.08)` | Dropdown, popover, modal. |

Rules:

- Use border first, shadow second.
- Keep shadows subtle and functional.
- Avoid glow, neon, bokeh, or decorative shadow effects.

---

## 10. Layout Rules

Application shell:

```txt
App Shell
- Sidebar
- Topbar
- Main Content
```

Page structure:

```txt
Page Header
Summary Section
Main Content
Supporting Notes or Actions
```

Rules:

- The first screen should be the actual application, not a landing page.
- Use a constrained main content width only when it improves reading; dashboards may use full available width.
- Use responsive grid tracks for cards and charts.
- Avoid nested cards.
- Avoid floating decorative section containers.
- Keep page headers concise and consistent.
- Dashboard pages should fit laptop demo scenarios without excessive scrolling before key context appears.

---

## 11. Sidebar Rules

Sidebar purpose:

- Provide stable navigation across the research workflow.
- Make the current page obvious.
- Keep demo flow predictable.

Sidebar items:

```txt
Dashboard
Dataset
Scraping
Preprocessing
Sentiment Analysis
Aspect Classification
AHP / Fuzzy AHP
Model Evaluation
Reports
Settings
```

Rules:

- Use icon plus label for each item when icons are available.
- Active item uses blue text or blue-soft background.
- Sidebar background should be white or very light slate.
- Keep navigation labels stable; do not rename routes casually.
- Use compact spacing but preserve readable click targets.
- Do not place marketing content in the sidebar.

---

## 12. Topbar Rules

Topbar purpose:

- Provide page context, status, and lightweight actions.

Rules:

- Keep topbar height stable.
- Use it for current dataset/model status, search, or page-level action.
- Do not duplicate the full sidebar navigation.
- Avoid heavy decorative branding.
- Use neutral dividers and subtle borders.
- Keep action buttons aligned to the right.

---

## 13. Card Rules

Card usage:

- Stat cards.
- Chart cards.
- Table containers.
- Result panels.
- AHP/Fuzzy AHP explanation panels.

Rules:

- Background is white.
- Border is `slate-200`.
- Radius is `8px`.
- Shadow is `shadow-sm` or none.
- Card title uses `heading-sm`.
- Card body uses `body-md`.
- Metric cards must include label, value, and optional supporting text.
- Do not put cards inside other cards.
- Do not use cards as decorative wrappers for full page sections.

---

## 14. Table Rules

Tables are core UI for SentiRank because review text, labels, scores, and model outputs need inspection.

Rules:

- Use readable row height.
- Use sticky or clearly visible table headers where useful.
- Use `body-sm` or `body-md` depending on density.
- Provide search, filter, and pagination for large datasets.
- Review text columns should truncate with an expand/detail option.
- Sentiment and aspect columns should use badges.
- Numeric columns should align right where comparison matters.
- Avoid showing too many columns at once.
- Empty, loading, and error states must be explicit.

---

## 15. Chart Rules

Charts should clarify the analysis, not decorate the dashboard.

Rules:

- Use simple bar, line, area, pie/donut only when appropriate.
- Prefer bar charts for aspect ranking and sentiment comparison.
- Prefer line charts only for time or batch trends.
- Avoid 3D charts.
- Avoid excessive color variety.
- Use semantic sentiment colors consistently.
- Every chart should have a title and nearby interpretation.
- Chart labels must be readable on laptop screens.
- Do not use dense Grafana-style monitoring panels as the default look.

---

## 16. Badge Rules

Badge usage:

- Sentiment labels.
- Aspect labels.
- Model status.
- Consistency ratio status.
- Dataset quality status.

Sentiment badge mapping:

| Sentiment | Style |
| --- | --- |
| Positive | Green text on green-soft background. |
| Neutral | Slate text on neutral-soft background. |
| Negative | Red text on negative-soft background. |

Aspect badge examples:

```txt
Performance
UI/UX
Ads
Subscription
Recommendation
Audio Quality
Bug/Error
Account/Login
```

Rules:

- Badges use `radius-sm`.
- Badge text must remain readable.
- Do not rely on color without text.
- Keep badge vocabulary consistent across pages.

---

## 17. Button Rules

Button types:

| Type | Usage |
| --- | --- |
| Primary | Main action on a page or section. |
| Secondary | Neutral action such as filter, open detail, or export preview. |
| Ghost | Low-emphasis toolbar action. |
| Destructive | Risky action only. |

Rules:

- Primary buttons use blue background and white text.
- Secondary buttons use white background, slate border, and slate text.
- Destructive buttons use red only for true destructive actions.
- Icon buttons should use recognizable icons with tooltip where needed.
- Do not place many primary buttons in one section.
- Buttons must have visible hover, focus, and disabled states.

---

## 18. Form and Input Rules

Form usage:

- Dataset import controls.
- Scraping parameters.
- Single review sentiment input.
- Filters and search.
- AHP/Fuzzy AHP judgement inputs.
- Settings configuration placeholders.

Rules:

- Every input must have a label.
- Helper text should explain format or purpose, not repeat the label.
- Error messages must be specific and placed near the field.
- Use consistent height for text inputs and selects.
- Use textarea for review text.
- Use segmented controls or tabs for mode switching.
- Use checkboxes or toggles only for binary settings.
- Use numeric inputs for matrix or threshold values.

---

## 19. Page-specific Design Rules

Dashboard:

- Show high-level summary first.
- Include total reviews, sentiment distribution, top negative aspect, priority preview, and model performance preview.
- Provide links to detail pages.

Dataset:

- Prioritize dataset quality, label distribution, and review table.
- Keep upload/import area clear and secondary to data inspection.

Scraping:

- Show batch status, requested count, collected count, failed count, and raw preview.
- Treat scraping as data collection context, not the main analysis result.

Preprocessing:

- Show pipeline steps and before/after examples.
- Make transformations explainable for thesis evaluation.

Sentiment Analysis:

- Support single review prediction and batch summary.
- Show label, confidence, distribution, and result table.

Aspect Classification:

- Show aspect frequency and negative review grouping.
- Make aspect labels easy to scan.

AHP / Fuzzy AHP:

- Show criteria, matrix, consistency, weights, ranking comparison, and final recommendation.
- Explain how final priority should be interpreted.

Model Evaluation:

- Show metrics clearly: accuracy, precision, recall, F1, macro F1, confusion matrix, and classification report.
- Make weak-class performance visible where relevant.

Reports:

- Summarize dataset, sentiment, aspect, AHP/Fuzzy AHP, and model evaluation results.
- Write summaries in report-ready language.

Settings:

- Keep configuration simple.
- Show API endpoint placeholders and model metadata without requiring working integration yet.

---

## 20. AHP/Fuzzy AHP Interface Rules

AHP/Fuzzy AHP pages need stronger structure because they combine method, numeric judgement, matrix data, and final ranking.

Rules:

- Do not hardcode the number of criteria in UI assumptions.
- Matrix cells must be large enough to read and edit.
- Pairwise comparison labels must show both criteria being compared.
- Consistency ratio must be visually prominent and explained.
- AHP weights and Fuzzy AHP weights must be comparable side by side.
- Ranking output must include rank, aspect, score/weight, and interpretation.
- Warnings should use amber, not red, unless there is a blocking error.
- Final recommendation must be stated in plain language.
- Use tables for exact values and charts only for comparison.
- Do not perform final methodology logic in frontend unless a later phase explicitly decides it.
- On the integrated AHP/Fuzzy AHP page, present read-only results from API Gateway data and do not expose calculation buttons on the main page.
- If expert judgement data is still sample, show an explicit sample notice before the page title and avoid labeling the ranking as final.

---

## 21. Accessibility Rules

- Text contrast must be strong on all backgrounds.
- Do not communicate status by color only.
- Buttons and inputs must have visible focus states.
- Form fields must have labels.
- Tables must have readable headers.
- Icons need accessible labels or adjacent text.
- Interactive elements need clear disabled and loading states.
- Avoid motion that is not necessary for understanding.
- Keep touch/click targets large enough for normal use.
- Ensure long review text does not break layout.

---

## 22. Do and Don't

Do:

- Use Light Mode as default.
- Use white cards on slate/off-white background.
- Use blue accent consistently.
- Use clean dashboard layout with sidebar navigation.
- Use readable tables and minimal charts.
- Use badges for sentiment, aspect, and status.
- Add interpretation near important analytical outputs.
- Keep screenshots thesis-friendly.
- Keep design professional, academic, and data-driven.

Don't:

- Do not build a landing page as the main experience.
- Do not use cyberpunk, neon, or glow effects.
- Do not use heavy glassmorphism.
- Do not make Dark Mode the default.
- Do not overuse colors in charts.
- Do not create dense monitoring-style dashboards.
- Do not hide key data behind decorative visuals.
- Do not rely only on Tailwind or shadcn defaults without applying SentiRank rules.
- Do not start implementation from screenshots alone.

---

## 23. Implementation Notes for NextJS, Tailwind CSS, and shadcn/ui

These notes guide later implementation phases only. FE-03 does not create runtime code.

NextJS:

- Use App Router in later setup.
- Use a dashboard route group for shared sidebar/topbar layout.
- Keep page components aligned with the IA route plan.
- API Gateway contracts are active for demo pages; do not use mock data as a production/demo fallback when Gateway requests fail.
- Gateway unavailable states must render the red API Gateway alert, zero/empty metric values, empty tables/charts, and the message `Data belum tersedia karena API Gateway belum aktif.`.
- The integrated AHP/Fuzzy AHP page is read-only: it displays Gateway data, hides sample warnings when Gateway is unavailable, and does not expose calculation actions on the main page.

TypeScript:

- Define explicit types for review, sentiment result, aspect result, AHP result, Fuzzy AHP result, model metric, and API response in later phases.
- Avoid untyped mock data.

Tailwind CSS:

- Translate color, spacing, radius, shadow, and typography tokens into Tailwind config or CSS variables during implementation.
- Prefer tokenized utility patterns over one-off arbitrary values.
- Keep layout dimensions stable for tables, cards, and matrix views.

shadcn/ui:

- Use shadcn/ui as a component foundation, not as the final design identity.
- Adapt variants to SentiRank colors, spacing, radius, and states.
- Prefer accessible primitives for buttons, inputs, dialogs, dropdowns, tabs, and tables.

API readiness:

- UI should work with API Gateway data first on integrated pages.
- Data sections must map cleanly to future FastAPI endpoints.
- Loading, empty, error, and success states should be planned for every data-heavy page.
