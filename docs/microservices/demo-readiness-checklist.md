# SentiRank Full-Stack Demo Readiness Checklist

## 1. Executive Summary

**Overall status: PASS WITH NOTE**

The repository passed static configuration checks, compilation, 86 backend tests,
frontend lint, and the production build. All six backend services were also
started directly with the project virtual environment, and the API Gateway
health, prediction, runtime inference, history, validation, and frontend
gateway-failure states were exercised.

The remaining pre-demo checks are operational. Docker Desktop was not running,
so the Compose stack could not be started. Browser interaction was not executed
because Playwright is not installed. The local Python environment also lacks the
IndoBERT inference dependencies, so sentiment correctly returned an explicit
fallback while the real SVM aspect model ran successfully. Do not present the
local fallback result as real IndoBERT inference.

## 2. Verification Date

| Item | Value |
| --- | --- |
| Date | 2026-06-20 |
| Milestone | MS-14A - Full-stack demo readiness verification |
| Working tree at start | Clean |
| Verification environment | Windows, PowerShell, project virtual environment |

## 3. Verified Milestone Scope

| Check | Status | Evidence |
| --- | --- | --- |
| Verification and documentation only | PASS | No feature, architecture, model, dataset, or schema changes were made. |
| Source baseline | PASS | `git status --short` was empty before verification. |
| Staged model binaries, `.env`, or cache files | PASS | No staged files were found. |
| Git secret scan | PASS | No tracked Hugging Face token pattern was found; only `.env.example` files are tracked. |
| Model artifact policy | PASS | `ml-service/saved_models/**/*` and IndoBERT `model.safetensors` are ignored by Git. |
| Prisma removal | PASS | No `prisma/` directory or `prisma.config.ts` remains. |

## 4. Backend Service Checklist

| Service | Compile | Tests | Runtime health |
| --- | --- | --- | --- |
| API Gateway | PASS | 33 passed | PASS |
| sentiment-service | PASS | 9 passed | PASS WITH NOTE - service healthy, local model dependencies unavailable |
| aspect-service | PASS | 10 passed | PASS - real `svm_merged_5class` loaded |
| review-service | PASS | 10 passed | PASS |
| decision-service | PASS | 19 passed | PASS |
| report-service | PASS | 5 passed | PASS |

All compile checks used `python -m compileall`. Tests used the project Python at
`ml-service/.venv/Scripts/python.exe`, an isolated `--basetemp`, and no training
commands. Total result: **86 passed**.

## 5. Frontend Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| `npm run lint` | PASS | Exit code 0. |
| `npm run build` | PASS | Exit code 0; all expected routes compiled. |
| `/inference` | PASS | Built and returned HTTP 200 in the running development server. |
| `/dashboard` | PASS | Built and returned HTTP 200. |
| `/ahp-fuzzy-ahp` | PASS WITH NOTE | Read-only output is active; sample status is shown as an amber notice and `Status Data: Sample`, not as a literal token badge. |
| Navigation | PASS | Expected menu entries compile; Reports/Laporan is absent. |
| Gateway-only frontend access | PASS | One shared `fetch` wrapper is used; no direct internal service URL or frontend file-based artifact read was found. |
| API base URL | PASS | Browser requests use `NEXT_PUBLIC_API_BASE_URL`; server requests may use `API_GATEWAY_INTERNAL_URL`. |
| Interactive browser flow | SKIPPED | MANUAL REQUIRED: neither Python nor Node Playwright is installed. HTTP/SSR behavior was verified instead. |

The production build generated these routes: `/`, `/dashboard`, `/dataset`,
`/scraping`, `/preprocessing`, `/sentiment-analysis`,
`/aspect-classification`, `/model-evaluation`, `/ahp-fuzzy-ahp`, `/inference`,
and `/settings`.

## 6. Docker Compose Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| `docker compose config` | PASS | Configuration rendered successfully. |
| `docker compose config --services` | PASS | Six default backend services were listed. |
| `docker compose config --profiles` | PASS | `frontend` and `postgres` profiles were listed. |
| Frontend profile config | PASS | `docker compose --profile frontend config --quiet` exited 0. |
| PostgreSQL profile config | PASS | `docker compose --profile postgres config --quiet` exited 0. |
| Default backend stack | PASS | API Gateway plus review, sentiment, aspect, decision, and report services are included. |
| report-service retained | PASS | Service remains available for Dashboard/evaluation/ranking aggregation. |
| SQLite default | PASS | API Gateway defaults to `sqlite:///./runtime_inference_history.db`. |
| PostgreSQL optional | PASS | PostgreSQL remains isolated under the `postgres` profile. |
| Prisma absent | PASS | No Prisma service or configuration remains. |
| Compose runtime start | BLOCKED | Docker daemon was not running; no destructive Docker command was used. |

Docker emitted a non-blocking warning that the current user could not read
`C:\\Users\\zakyj\\.docker\\config.json`. Static Compose validation still passed.

## 7. API Endpoint Checklist

The services were started directly with the project virtual environment because
Docker was unavailable.

| Endpoint | Status | Result |
| --- | --- | --- |
| `GET /health` | PASS | `success: true`; API Gateway healthy. |
| `GET /health/services` | PASS | All six services reported healthy. |
| `POST /sentiment/predict` | PASS WITH NOTE | `Negative`; model name preserved; explicit `fallback_rule` because local IndoBERT dependencies are missing. |
| `POST /aspects/classify` | PASS | `Ads Experience`; `prediction_source: model`; `model_name: svm_merged_5class`; `is_fallback: false`. |
| `POST /inference/review` | PASS | Sentiment and aspect returned; `saved: true`; `created_at` present; provenance preserved. |
| `GET /inference/history` | PASS | Items returned and newest record appeared first. |
| Empty inference input | PASS | Controlled HTTP 422 with `Teks ulasan wajib diisi.` and no stack trace. |

The first cold direct prediction requests exceeded the Gateway service timeout
while models initialized. Warm retries passed. Start services before the live
presentation and execute one warm-up request.

## 8. Runtime Inference Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| Combined sentiment and aspect response | PASS | Both result objects were returned through API Gateway. |
| Prediction provenance | PASS | `mode`, `prediction_source`, `model_name`, `model_available`, and `is_fallback` were retained. |
| Save result | PASS | API response returned `saved: true`. |
| Timestamp | PASS | UTC `created_at` was returned. |
| History ordering | PASS | Second submitted record matched the first history item. |
| Frontend history rendering | PASS | `/inference` SSR contained the latest persisted review while Gateway was active. |

## 9. Database Persistence Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| SQLite local/demo default | PASS | Confirmed in Compose, config, and documentation. |
| Runtime history persistence | PASS | Records remained available after restarting the API Gateway process with the same temporary SQLite database. |
| PostgreSQL optional mode | PASS WITH NOTE | Compose profile validates; runtime connection was not executed. |
| Research artifact boundary | PASS | CSV/JSON remain read-only research artifacts; frontend does not read them directly. |
| Auth/session identifiers | PASS | No auth, `userId`, or `sessionId` was added by MS-14A. |

## 10. Model Serving Checklist

| Model | Status | Evidence |
| --- | --- | --- |
| IndoBERT selected run | PASS | `run_3_weighted_loss_lr_1e-5` artifact path exists and remains ignored by Git. |
| IndoBERT real local inference | BLOCKED | Local project virtual environment lacks the inference dependencies; API returned explicit fallback and warnings. Verify `mode: model` in the Docker demo environment. |
| SVM selected classifier | PASS | `svm_merged_5class_pipeline.joblib` loaded and served model predictions. |
| SVM provenance | PASS | `prediction_source: model`, `model_name: svm_merged_5class`, `is_fallback: false`. |
| Model binaries staged/tracked | PASS | No model binary is staged; saved model policy remains ignored. |

## 11. AHP/Fuzzy AHP Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| Page route | PASS | `/ahp-fuzzy-ahp` built and returned HTTP 200. |
| Read-only behavior | PASS | Active page imports only overview/read services; no calculation button appears. |
| Sample/development disclosure | PASS WITH NOTE | An amber notice states that data is still sample and awaits final expert judgement; the exact machine labels are not rendered as badges. |
| Frontend calculation | PASS | No active AHP/Fuzzy AHP calculation UI exists. |
| Gateway unavailable state | PASS | Gateway alert and unavailable state appear; the sample notice is hidden. |

An unused legacy `AhpGatewayDemoPanel.tsx` component still contains calculation
copy, but it is not imported by the active app route. Removing dormant code is a
separate cleanup task, not part of MS-14A.

## 12. API Gateway Failure Fallback Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| Dashboard Gateway alert | PASS | Red API Gateway alert and unavailable state rendered with Gateway stopped. |
| Inference Gateway alert | PASS | Red alert and empty state rendered. |
| No stale inference shown as live | PASS | Previously persisted review text was absent after Gateway stopped. |
| AHP unavailable behavior | PASS | Unavailable state rendered and sample notice was hidden. |
| Mock data presented as live | PASS | No gateway-off check exposed mock data as current API data. |

## 13. Deployment Mode Readiness

| Mode | Status | Notes |
| --- | --- | --- |
| Local frontend plus local backend | PASS WITH NOTE | Static checks and direct-service runtime checks passed; start Docker Desktop and confirm real IndoBERT before presentation. |
| Full Compose backend | BLOCKED | Docker daemon unavailable during verification. |
| Optional Compose frontend | PASS WITH NOTE | Profile configuration validates; container runtime not executed. |
| Optional PostgreSQL | PASS WITH NOTE | Profile configuration validates; database runtime not executed. |
| Semi-online frontend | TODO | Optional operational mode only; no deployment or tunnel was created in MS-14A. |

## 14. Known Limitations

1. Docker runtime behavior was not executed because the daemon was offline.
2. Real IndoBERT serving was not proven in the local virtual environment; the
   API correctly exposed fallback provenance.
3. Interactive submit and visual checks remain manual because Playwright is not
   installed. HTTP route and SSR state checks passed.
4. Cold model initialization can exceed the Gateway timeout on the first direct
   prediction request. Warm the stack before the presentation.
5. The AHP/Fuzzy AHP page uses sample/development data until final expert
   judgement is available.
6. PostgreSQL and semi-online deployment modes were configuration-checked only.
7. An empty `frontend/app/reports/` directory remains, but no page file, route,
   menu entry, or print-report feature exists.

## 15. Manual Demo Script

1. Start Docker Desktop and wait until the daemon is ready.
2. Start the backend stack from the repository root:

   ```powershell
   docker compose up --build
   ```

3. Confirm `http://localhost:8000/health` and
   `http://localhost:8000/health/services` return healthy results.
4. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm run dev
   ```

5. Open `http://localhost:3000`, then open `/inference`.
6. Submit: `iklan terlalu banyak dan aplikasi sering lag`.
7. Confirm and explain:
   - IndoBERT predicts sentiment.
   - SVM predicts the aspect/criterion.
   - API Gateway saves runtime inference history.
   - The history table shows the newest record first.
   - Provenance must show model or explicit fallback honestly.
8. Open `/dashboard` and explain the aggregated research/runtime overview.
9. Open `/ahp-fuzzy-ahp` and explain that it is read-only, currently uses
   sample/development judgement, and will be replaced by final expert judgement.
10. Stop API Gateway temporarily and refresh `/dashboard` and `/inference`.
    Confirm the red alert and empty state, with no mock data shown as live.
11. Optional semi-online mode: expose the local API Gateway through a secure
    tunnel, deploy the frontend to Vercel, and set `NEXT_PUBLIC_API_BASE_URL`
    to the tunnel URL. This is not required for the local thesis demo.

Before presenting, execute one warm-up call and verify the sentiment response has
`mode: model` and `prediction_source: model`. If it remains fallback, do not
claim that IndoBERT is serving live.

## 16. Remaining TODO

| Priority | Item | Status |
| --- | --- | --- |
| 1 | Start Docker Desktop and run the default Compose backend stack. | TODO |
| 2 | Verify real IndoBERT response uses `mode: model` and `prediction_source: model`. | TODO |
| 3 | Execute the browser submit/history flow and visually inspect responsive states. | TODO |
| 4 | Warm up sentiment and aspect endpoints before the supervisor demo. | TODO |
| 5 | Optionally normalize the AHP sample notice into an explicit badge in a later UI milestone. | TODO |
| 6 | Optionally remove the empty Reports directory and dormant unused AHP demo component in a dedicated cleanup milestone. | TODO |
