# SentiRank

AI-based Decision Support Dashboard for Sentiment Analysis, Aspect Classification, and AHP-based Recommendation Ranking.

## Tech Stack

- Next.js 15 (TypeScript)
- Tailwind CSS, shadcn/ui, Recharts
- FastAPI microservices behind `api-gateway-service`
- Runtime persistence boundary for user inference history
- CSV/JSON/model artifacts as read-only reproducible research outputs
- Python ML/research pipeline (IndoBERT, SVM, PyTorch, scikit-learn)

## Data Source Policy

SentiRank does not migrate every research CSV/JSON artifact into the database. Research artifacts under `datasets/`, `docs/figures/`, and model artifact folders are allowed as read-only, reproducible thesis outputs for dataset summaries, preprocessing summaries, model evaluation, AHP/Fuzzy AHP outputs, and ranking comparison views.

The database is reserved for user-facing runtime data such as submitted review text, prediction results, model version, confidence/probability, prediction source, timestamps, and inference history. Frontend code must call only the API Gateway through `NEXT_PUBLIC_API_BASE_URL`; it must not read artifacts directly, call internal service ports, or calculate AHP/Fuzzy AHP locally.

## Structure

See `CLAUDE.md` and `docs/microservices/architecture.md` for full architecture, data ownership, and service boundary rules.
