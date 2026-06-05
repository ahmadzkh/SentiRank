# API Integration Plan - SentiRank Frontend

## Document Information

| Field | Description |
| --- | --- |
| Project | SentiRank |
| Module | Frontend |
| Phase | FE-12 + MS-10 - API Gateway Integration |
| Date | 2026-06-05 |
| Status | Updated |
| Strategy | API Gateway-only frontend integration |

---

## 1. Purpose

Dokumen ini mendefinisikan integrasi API frontend SentiRank dengan backend/FastAPI melalui `api-gateway-service`.

MS-10 mengunci aturan bahwa frontend hanya memanggil API Gateway. Internal service ports seperti `8001`, `8002`, `8003`, `8004`, dan `8005` tidak boleh dipanggil langsung dari browser.

---

## 2. API Integration Strategy

Strategi integrasi menggunakan service layer terpisah:

```txt
Page / Component
-> Service Function
-> HTTP Client
-> API Endpoint Constant
-> API Gateway
-> Internal Microservice
```

Prinsip MS-10:

- Frontend menggunakan `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
- Service layer memakai route Gateway, bukan `/api/*` Next.js route placeholder.
- HTTP client membuka envelope Gateway dan mengembalikan `data`.
- AHP/Fuzzy AHP demo memanggil `decision-service` hanya melalui Gateway.
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

| Group | Gateway Path | Usage |
| --- | --- | --- |
| Review API | `/reviews/random` | Review sample access. |
| Dataset API | `/dataset/summary` | Dataset summary and metadata. |
| Scraping API | `/scraping/summary` | Scraping batch summary and status. |
| Preprocessing API | `/preprocessing/summary` | Preprocessing summary and processed data status. |
| Sentiment API | `/sentiment/*` | Sentiment prediction, summary, and evaluation. |
| Aspect API | `/aspects/*` | Aspect classification, summary, and evaluation. |
| AHP/Fuzzy AHP API | `/ahp/*` | AHP, Fuzzy AHP, and comparison calculation through Gateway. |
| Model Evaluation API | `/evaluation/summary` | Consolidated model evaluation summary. |
| Report API | `/reports/summary` | Research report summary. |
| Health API | `/health`, `/health/services` | Gateway and internal service status. |

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

Each service opens the Gateway response envelope and returns the business `data` payload. For low-level diagnostics, `httpClient.request<T>()` can still return the normalized envelope.

---

## 6. Data Flow Plan

Current MS-10 flow:

```txt
Pages -> Mock Data by default
AHP/Fuzzy AHP demo panel -> Service Functions -> API Gateway -> decision-service
```

Future page migration flow:

```txt
Pages -> Service Functions -> HTTP Client -> API Gateway -> Internal Service
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

The HTTP client normalizes failed requests and exposes this offline Gateway message to UI integrations:

```txt
API Gateway belum aktif. Jalankan microservice backend terlebih dahulu.
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

## 11. MS-10 Acceptance Criteria

- [x] `NEXT_PUBLIC_API_BASE_URL` points to `http://localhost:8000`.
- [x] Frontend endpoint constants use API Gateway public routes.
- [x] HTTP client can unwrap the Gateway response envelope.
- [x] AHP/Fuzzy AHP demo panel calls `/ahp/criteria`, `/ahp/calculate`, `/ahp/fuzzy-calculate`, and `/ahp/compare` through the Gateway.
- [x] AHP/Fuzzy AHP sample warning remains visible.
- [x] Frontend does not call internal service ports directly.
- [x] Frontend does not calculate AHP/Fuzzy AHP weights locally.

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
