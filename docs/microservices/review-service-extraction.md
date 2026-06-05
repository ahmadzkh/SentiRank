# Review Service Extraction

## Purpose

MS-06 extracts review and research-output summary responsibilities into `review-service`.

The service reads existing file-based research outputs from the SentiRank repository and exposes read-only summary/sample APIs for the API Gateway. It does not scrape, preprocess, mutate datasets, or write generated outputs.

## Responsibilities

`review-service` owns:

- dataset summary
- scraping summary
- preprocessing summary
- random review samples
- available EDA/metrics summaries from completed research phases

It does not own:

- sentiment inference
- aspect classification
- AHP/Fuzzy AHP calculation
- model training
- data scraping
- preprocessing execution
- database persistence

## Implemented Endpoints

Internal service endpoints:

- `GET /`
- `GET /health`
- `GET /reviews/random`
- `GET /dataset/summary`
- `GET /scraping/summary`
- `GET /preprocessing/summary`

Gateway public routes:

- `GET /reviews/random`
- `GET /dataset/summary`
- `GET /scraping/summary`
- `GET /preprocessing/summary`

## Data Source Strategy

The service reads existing repository outputs from:

- `datasets/raw/`
- `datasets/processed/`
- `datasets/outputs/eda/`
- `docs/`

In Docker Compose, these folders are mounted read-only:

```yaml
volumes:
  - ./datasets:/app/datasets:ro
  - ./docs:/app/docs:ro
```

The container uses:

```text
DATASETS_DIR=/app/datasets
DOCS_DIR=/app/docs
```

For local non-Docker development, the service searches upward from the current working directory until it finds repository-level `datasets/` and `docs/` folders.

## Missing File Behavior

Raw and processed datasets may be ignored or absent on another checkout. Missing files do not crash summary endpoints.

Summary endpoints return a successful response with a `warnings` list describing missing local files. Random review samples return an empty review list with warnings when neither the preferred processed CSV nor the raw fallback CSV exists.

## Random Review Samples

`GET /reviews/random` supports:

- `limit`, default `10`, clamped to `50`
- `sentiment`
- `rating`
- `seed`

Preferred data source:

```text
datasets/processed/reviews_final.csv
```

Fallback data source:

```text
datasets/raw/reviews_raw_labeled.csv
```

The response intentionally exposes only safe review fields:

- `external_id`
- `rating`
- `content`
- `initial_sentiment`
- `final_sentiment`
- `reviewed_at`
- `source`

`author_name` is not returned.

## API Gateway Integration

As of MS-06, `api-gateway-service` forwards public review/data routes to `review-service`.

The frontend should continue to call only:

```text
http://localhost:8000
```

Internal routing:

```text
frontend-service -> api-gateway-service -> review-service
```

## Limitation

The current service is a read-only file-backed research-output service. Database-backed review/query APIs can be considered later if the thesis implementation requires persistence or richer filtering.
