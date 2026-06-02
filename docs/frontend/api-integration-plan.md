# API Integration Plan - SentiRank Frontend

## Document Information

| Field | Description |
| --- | --- |
| Project | SentiRank |
| Module | Frontend |
| Phase | FE-12 - API Integration Preparation |
| Date | 2026-06-02 |
| Status | Approved |
| Strategy | Mock-first and API-contract-ready |

---

## 1. Purpose

Dokumen ini mendefinisikan persiapan integrasi API frontend SentiRank dengan backend/FastAPI tanpa mengubah perilaku halaman yang masih mock-first.

FE-12 tidak melakukan integrasi penuh. Tujuan fase ini adalah menyiapkan fondasi agar halaman Dashboard, Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification, AHP/Fuzzy AHP, Model Evaluation, Reports, dan Settings dapat dipindahkan dari mock data ke API secara bertahap pada fase berikutnya.

---

## 2. API Integration Strategy

Strategi integrasi menggunakan service layer terpisah:

```txt
Page / Component
-> Service Function
-> HTTP Client
-> API Endpoint Constant
-> FastAPI Backend
```

Prinsip FE-12:

- Halaman tetap memakai mock data.
- Service function sudah tersedia tetapi belum dipanggil oleh halaman.
- Endpoint masih draft placeholder.
- Error response dinormalisasi melalui `ApiResponse<T>`.
- AHP dan Fuzzy AHP tetap dihitung oleh backend/service, bukan frontend.

---

## 3. Environment Variable Usage

Frontend menggunakan environment variable:

```txt
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

File contoh disediakan di:

```txt
frontend/.env.example
```

Catatan:

- Nilai development default diarahkan ke FastAPI lokal.
- Nilai production harus diatur oleh deployment environment.
- Jangan menyimpan secret backend di variable `NEXT_PUBLIC_*` karena variable tersebut dapat terbaca oleh browser.

---

## 4. Endpoint Groups

Draft endpoint group FE-12:

| Group | Base Path | Planned Usage |
| --- | --- | --- |
| Review API | `/api/reviews` | Review list and review data access. |
| Dataset API | `/api/dataset` | Dataset summary and metadata. |
| Scraping API | `/api/scraping` | Scraping batch summary and status. |
| Preprocessing API | `/api/preprocessing` | Preprocessing summary and processed data status. |
| Sentiment API | `/api/sentiment` | Sentiment prediction and sentiment summary. |
| Aspect API | `/api/aspects` | Aspect classification and aspect summary. |
| AHP API | `/api/ahp` | AHP calculation service. |
| Fuzzy AHP API | `/api/fuzzy-ahp` | Fuzzy AHP calculation service. |
| Model Evaluation API | `/api/evaluation` | Model evaluation summary. |
| Report API | `/api/reports` | Research report summary. |

Endpoint constants are stored in:

```txt
frontend/lib/api-endpoints.ts
```

---

## 5. Service Layer Structure

Service files are stored in:

```txt
frontend/services/
```

Planned service functions:

| Service | Function |
| --- | --- |
| `review-service.ts` | `getReviews(query?)` |
| `dataset-service.ts` | `getDatasetSummary()` |
| `scraping-service.ts` | `getScrapingSummary()` |
| `preprocessing-service.ts` | `getPreprocessingSummary()` |
| `sentiment-service.ts` | `predictSentiment(input)`, `getSentimentSummary()` |
| `aspect-service.ts` | `classifyAspect(input)`, `getAspectSummary()` |
| `ahp-service.ts` | `calculateAhp(input)` |
| `fuzzy-ahp-service.ts` | `calculateFuzzyAhp(input)` |
| `evaluation-service.ts` | `getEvaluationSummary()` |
| `report-service.ts` | `getReportSummary()` |

Each service returns `Promise<ApiResponse<T>>` and includes TODO notes for later backend contract connection.

---

## 6. Data Flow Plan

Current FE-12 flow:

```txt
Pages -> Mock Data
Services -> Not called yet
```

Future integration flow:

```txt
Pages -> Service Functions -> HTTP Client -> FastAPI -> ApiResponse<T>
```

Migration should happen page by page. Each page should keep a clear fallback or loading/error state before mock data is removed.

---

## 7. Mock-to-Real Migration Plan

Recommended migration order:

1. Connect Settings to API health/status metadata.
2. Connect Dataset and Review API.
3. Connect Scraping and Preprocessing summaries.
4. Connect Sentiment and Aspect APIs.
5. Connect Model Evaluation API.
6. Connect Report API.
7. Connect AHP and Fuzzy AHP calculation APIs after methodology contracts are stable.

Rules:

- Do not replace all mock data at once.
- Validate response shape per page.
- Keep TypeScript DTOs aligned with backend contracts.
- Keep AHP/Fuzzy AHP calculation outside frontend.

---

## 8. Error and Loading Handling Plan

The HTTP client normalizes failed requests into:

```txt
ApiResponse<T>
success: false
data: null
error: { code, message, details }
```

Future page integration should add:

- loading state before request completion;
- empty state when `data` is valid but empty;
- error state when `success === false`;
- not-ready state when prerequisite data is missing;
- retry action only after a real service call exists.

---

## 9. Security Notes

- `NEXT_PUBLIC_API_BASE_URL` is public and must not contain secrets.
- Authentication tokens, if added later, should be handled through a deliberate auth strategy.
- Avoid exposing backend stack traces in UI.
- Do not put API keys or service credentials in frontend code.
- Validate user input on backend even if frontend validation exists.
- AHP/Fuzzy AHP calculation logic should stay in backend/service to keep methodology auditable.

---

## 10. FE-12 Acceptance Criteria

FE-12 is complete when:

- [x] `frontend/lib/http-client.ts` exists.
- [x] `frontend/lib/api.ts` exists.
- [x] `frontend/lib/api-endpoints.ts` exists.
- [x] `frontend/.env.example` includes `NEXT_PUBLIC_API_BASE_URL`.
- [x] Endpoint constants exist for Review, Dataset, Scraping, Preprocessing, Sentiment, Aspect, AHP, Fuzzy AHP, Model Evaluation, and Report APIs.
- [x] Service modules exist for all planned API groups.
- [x] Service functions return typed promises.
- [x] Existing pages remain mock-first.
- [x] No real API calls are wired into pages.
- [x] No backend or ml-service files are modified.
- [x] No AHP/Fuzzy AHP calculation is implemented in frontend.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] `docs/frontend/frontend-tasks.md` is updated.
- [x] `docs/frontend/design-decision-log.md` records `FE-12-D01` as approved.
