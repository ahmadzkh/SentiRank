# SentiRank Microservice API Contract

## Purpose

This document defines the target API contract for the SentiRank API Gateway and internal microservices. It is a planning document for the gradual migration from the current modular backend toward Microservice Architecture.

## Global Response Envelope

All public and internal services should use the same response envelope.

Success response:

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Request failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {}
  }
}
```

## API Gateway Public Endpoints

The frontend calls these API Gateway routes only. Internal service ports must not be exposed to the frontend.

As of MS-05, the public AHP/Fuzzy AHP routes are implemented in `api-gateway-service` and forwarded to `decision-service`. The gateway preserves the decision-service response envelope and does not calculate AHP or Fuzzy AHP directly.

As of MS-06, the public review/data routes are implemented in `api-gateway-service` and forwarded to `review-service`. The gateway preserves the review-service response envelope and does not read datasets directly.

As of MS-07, the public sentiment routes are implemented in `api-gateway-service` and forwarded to `sentiment-service`. The gateway preserves the sentiment-service response envelope and does not perform IndoBERT inference directly.

As of MS-08, the public aspect routes are implemented in `api-gateway-service` and forwarded to `aspect-service`. The gateway preserves the aspect-service response envelope and does not perform SVM aspect classification directly.

As of MS-09, the public report/evaluation summary routes are implemented in `api-gateway-service` and forwarded to `report-service`. The gateway preserves the report-service response envelope and does not train models or calculate final AHP/Fuzzy AHP rankings.

As of MS-12A, runtime review inference routes are implemented in `api-gateway-service`. The gateway orchestrates sentiment prediction through `sentiment-service`, aspect classification through `aspect-service`, persists combined user-submitted inference history, and does not calculate sentiment or aspects locally.

### AHP and Fuzzy AHP

- `GET /ahp/criteria`
- `POST /ahp/calculate`
- `POST /ahp/fuzzy-calculate`
- `POST /ahp/compare`

### Review and Dataset

- `GET /reviews/random`
- `GET /dataset/summary`
- `GET /scraping/summary`
- `GET /preprocessing/summary`

### Sentiment

- `POST /sentiment/predict`
- `GET /sentiment/summary`
- `GET /sentiment/evaluation`

### Aspect

- `POST /aspects/classify`
- `GET /aspects/summary`
- `GET /aspects/evaluation`

### Report

- `GET /reports/summary`
- `GET /evaluation/summary`

### Runtime Inference

- `POST /inference/review`
- `GET /inference/history`
- `GET /inference/health`

### Health

- `GET /health`
- `GET /health/services`

## Internal Service Endpoints

### review-service

- `GET /reviews/random`
- `GET /dataset/summary`
- `GET /scraping/summary`
- `GET /preprocessing/summary`

### sentiment-service

- `POST /sentiment/predict`
- `GET /sentiment/summary`
- `GET /sentiment/evaluation`

### aspect-service

- `POST /aspects/classify`
- `GET /aspects/summary`
- `GET /aspects/evaluation`

### decision-service

- `GET /ahp/criteria`
- `POST /ahp/calculate`
- `POST /ahp/fuzzy-calculate`
- `POST /ahp/compare`

### report-service

- `GET /reports/summary`
- `GET /evaluation/summary`

## Payload Examples

### AHP Criteria

Request:

```http
GET /ahp/criteria
```

Response:

```json
{
  "success": true,
  "message": "AHP criteria loaded.",
  "data": {
    "criteria": [
      {
        "id": "C1",
        "name": "Features, Content & Audio Experience"
      },
      {
        "id": "C2",
        "name": "App Reliability & Usability"
      },
      {
        "id": "C3",
        "name": "Ads Experience"
      },
      {
        "id": "C4",
        "name": "Subscription & Pricing"
      },
      {
        "id": "C5",
        "name": "Account/Login"
      }
    ]
  }
}
```

### AHP Calculate

Demo request marked as sample/development only:

```json
{
  "run_label": "sample_development_only",
  "not_final_expert_judgement": true,
  "criteria": [
    { "id": "C1", "name": "Features, Content & Audio Experience" },
    { "id": "C2", "name": "App Reliability & Usability" },
    { "id": "C3", "name": "Ads Experience" },
    { "id": "C4", "name": "Subscription & Pricing" },
    { "id": "C5", "name": "Account/Login" }
  ],
  "comparisons": [
    {
      "criterion_a": "C1",
      "criterion_b": "C2",
      "value_a_over_b": 0.3333333333,
      "justification": "Sample development only."
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "message": "AHP calculation completed.",
  "data": {
    "run_label": "sample_development_only",
    "not_final_expert_judgement": true,
    "weights": [
      {
        "criterion_id": "C2",
        "criterion_name": "App Reliability & Usability",
        "weight": 0.5294117647,
        "rank": 1
      }
    ],
    "consistency_ratio": 0.0,
    "is_consistent": true
  }
}
```

### Fuzzy AHP Calculate

Demo request marked as sample/development only:

```json
{
  "run_label": "sample_development_only",
  "not_final_expert_judgement": true,
  "defuzzification_method": "centroid",
  "criteria": [
    { "id": "C1", "name": "Features, Content & Audio Experience" },
    { "id": "C2", "name": "App Reliability & Usability" },
    { "id": "C3", "name": "Ads Experience" },
    { "id": "C4", "name": "Subscription & Pricing" },
    { "id": "C5", "name": "Account/Login" }
  ],
  "comparisons": [
    {
      "criterion_a": "C1",
      "criterion_b": "C2",
      "fuzzy_value_a_over_b": {
        "l": 0.25,
        "m": 0.3333333333,
        "u": 0.5
      },
      "linguistic_scale": "moderate",
      "justification": "Sample development only."
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "message": "Fuzzy AHP calculation completed.",
  "data": {
    "run_label": "sample_development_only",
    "not_final_expert_judgement": true,
    "defuzzification_method": "centroid",
    "weights": [
      {
        "criterion_id": "C2",
        "criterion_name": "App Reliability & Usability",
        "normalized_weight": 0.52,
        "rank": 1
      }
    ],
    "consistency_ratio_modal": 0.0,
    "is_consistent_modal": true
  }
}
```

### AHP vs Fuzzy AHP Compare

Request:

```json
{
  "run_label": "sample_development_only",
  "not_final_expert_judgement": true,
  "ahp_weights": [
    {
      "criterion_id": "C2",
      "criterion_name": "App Reliability & Usability",
      "weight": 0.5294117647,
      "rank": 1
    }
  ],
  "fuzzy_ahp_weights": [
    {
      "criterion_id": "C2",
      "criterion_name": "App Reliability & Usability",
      "normalized_weight": 0.52,
      "rank": 1
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "message": "AHP and Fuzzy AHP comparison completed.",
  "data": {
    "summary": {
      "total_criteria": 5,
      "changed_rank_count": 0,
      "identical_top_rank": true
    }
  }
}
```

### Random Reviews

Request:

```http
GET /reviews/random?limit=5&sentiment=Negative&rating=1&seed=42
```

Response:

```json
{
  "success": true,
  "message": "Random review samples loaded.",
  "data": {
    "reviews": [
      {
        "external_id": "review_001",
        "rating": 1,
        "content": "Akun saya tidak bisa login.",
        "initial_sentiment": "Negative",
        "final_sentiment": "Negative",
        "reviewed_at": "2026-05-13T02:16:04",
        "source": "google_play_spotify_id"
      }
    ],
    "count": 1,
    "filters": {
      "limit": 5,
      "applied_limit": 5,
      "sentiment": "Negative",
      "rating": 1,
      "seed": 42
    },
    "warnings": []
  }
}
```

### Dataset Summary

Request:

```http
GET /dataset/summary
```

Response:

```json
{
  "success": true,
  "message": "Dataset summary loaded.",
  "data": {
    "dataset_availability": {
      "data_acquisition_summary": true,
      "scraping_summary": true,
      "reviews_final": true
    },
    "total_review_count": 97782,
    "rating_distribution": {
      "1": 20000,
      "2": 15000,
      "3": 27782,
      "4": 15000,
      "5": 20000
    },
    "sentiment_distribution": {
      "Negative": 35000,
      "Neutral": 27782,
      "Positive": 35000
    },
    "warnings": []
  }
}
```

### Scraping Summary

Request:

```http
GET /scraping/summary
```

Response:

```json
{
  "success": true,
  "message": "Scraping summary loaded.",
  "data": {
    "app_id": "com.spotify.music",
    "source_name": "google_play_spotify_id",
    "target_quota_per_rating": {
      "1": 20000,
      "2": 15000,
      "3": 30000,
      "4": 15000,
      "5": 20000
    },
    "achieved_count_per_rating": {
      "1": 20000,
      "2": 15000,
      "3": 27782,
      "4": 15000,
      "5": 20000
    },
    "total_achieved_rows": 97782,
    "rating_3_limitation_note": "Rating 3 target was 30,000 reviews, but only 27,782 were available.",
    "warnings": []
  }
}
```

### Preprocessing Summary

Request:

```http
GET /preprocessing/summary
```

Response:

```json
{
  "success": true,
  "message": "Preprocessing summary loaded.",
  "data": {
    "total_rows": 97782,
    "relabeling_changes": {
      "changed_label_count": 10153,
      "changed_label_percentage": 10.3833,
      "rating_3_changed_count": 10153
    },
    "sentiment_distribution_before": {
      "Negative": 35000,
      "Neutral": 27782,
      "Positive": 35000
    },
    "sentiment_distribution_after": {
      "Negative": 39686,
      "Neutral": 17629,
      "Positive": 40467
    },
    "general_fallback_limitation": {
      "note": "General fallback labels are weak-label coverage gaps and are not final AHP/Fuzzy AHP criteria."
    },
    "warnings": []
  }
}
```

### Sentiment Predict

Request:

```json
{
  "text": "Aplikasi sering error dan lambat.",
  "run_label": "demo"
}
```

Model response when the IndoBERT artifact is available:

```json
{
  "success": true,
  "message": "Sentiment prediction completed.",
  "data": {
    "text": "Aplikasi sering error dan lambat.",
    "label": "Negative",
    "confidence": 0.91,
    "probabilities": {
      "Negative": 0.91,
      "Neutral": 0.06,
      "Positive": 0.03
    },
    "model_name": "run_3_weighted_loss_lr_1e-5",
    "mode": "model",
    "prediction_source": "model",
    "model_available": true,
    "is_fallback": false,
    "warnings": []
  }
}
```

### Runtime Review Inference

Request:

```http
POST /inference/review
Content-Type: application/json
```

```json
{
  "text": "iklan terlalu banyak dan aplikasi sering lag"
}
```

Response:

```json
{
  "success": true,
  "message": "Inference completed and saved.",
  "data": {
    "id": "6a2c9a4d-9e3d-4b1f-a6c5-7e3f4c1a1234",
    "text": "iklan terlalu banyak dan aplikasi sering lag",
    "sentiment": {
      "label": "Negative",
      "confidence": 0.94,
      "probabilities": {
        "Negative": 0.94,
        "Neutral": 0.04,
        "Positive": 0.02
      },
      "model_name": "run_3_weighted_loss_lr_1e-5",
      "mode": "model",
      "prediction_source": "model",
      "model_available": true,
      "is_fallback": false
    },
    "aspect": {
      "label": "Ads Experience",
      "confidence": 0.88,
      "scores": {
        "Ads Experience": 0.88
      },
      "model_name": "svm_merged_5class",
      "mode": "model",
      "prediction_source": "model",
      "model_available": true,
      "is_fallback": false
    },
    "saved": true,
    "created_at": "2026-06-19T00:00:00+00:00"
  }
}
```

Validation error:

```json
{
  "success": false,
  "message": "Teks ulasan wajib diisi.",
  "data": null
}
```

### Runtime Inference History

Request:

```http
GET /inference/history?limit=20
```

Response:

```json
{
  "success": true,
  "message": "Inference history loaded.",
  "data": {
    "items": [
      {
        "id": "6a2c9a4d-9e3d-4b1f-a6c5-7e3f4c1a1234",
        "text": "iklan terlalu banyak dan aplikasi sering lag",
        "sentiment": {
          "label": "Negative",
          "confidence": 0.94,
          "model_name": "run_3_weighted_loss_lr_1e-5",
          "prediction_source": "model",
          "is_fallback": false
        },
        "aspect": {
          "label": "Ads Experience",
          "confidence": 0.88,
          "model_name": "svm_merged_5class",
          "prediction_source": "model",
          "is_fallback": false
        },
        "created_at": "2026-06-19T00:00:00+00:00"
      }
    ],
    "total": 1
  }
}
```

The runtime database stores only user-submitted inference history. It does not store all research CSV/JSON artifacts.

Fallback response when the IndoBERT model artifact is not available:

```json
{
  "success": true,
  "message": "Sentiment prediction completed.",
  "data": {
    "text": "Aplikasi sering error dan lambat.",
    "label": "Negative",
    "confidence": 0.78,
    "probabilities": {
      "Negative": 0.78,
      "Neutral": 0.12,
      "Positive": 0.1
    },
    "model_name": "run_3_weighted_loss_lr_1e-5",
    "mode": "fallback",
    "prediction_source": "fallback_rule",
    "model_available": false,
    "is_fallback": true,
    "warnings": [
      "Model artifact is not available. Returning explicit fallback prediction."
    ]
  }
}
```

The fallback mode is for service continuity only. It must not be interpreted as real IndoBERT inference.

### Sentiment Summary

Request:

```http
GET /sentiment/summary
```

Response:

```json
{
  "success": true,
  "message": "Sentiment summary loaded.",
  "data": {
    "selected_model": "run_3_weighted_loss_lr_1e-5",
    "sentiment_labels": ["Negative", "Neutral", "Positive"],
    "model_status": "unavailable",
    "model_available": false,
    "model_source": "fallback",
    "configured_model_path": "ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5",
    "configured_model_id": "ahmadzkh/sentirank-indobert-run3",
    "max_length": 128,
    "prediction_source": "fallback_rule",
    "is_fallback": true,
    "final_sentiment_distribution": {
      "Negative": 39686,
      "Neutral": 17629,
      "Positive": 40467
    },
    "warnings": []
  }
}
```

### Sentiment Evaluation

Request:

```http
GET /sentiment/evaluation
```

Response:

```json
{
  "success": true,
  "message": "Sentiment evaluation loaded.",
  "data": {
    "selected_candidate": "run_3_weighted_loss_lr_1e-5",
    "selected_metrics": {
      "accuracy": 0.7362285247,
      "f1_macro": 0.7093262951,
      "f1_weighted": 0.7444675722,
      "neutral_recall": 0.6669187146,
      "neutral_f1": 0.5562036891
    },
    "limitations": [
      "Model artifact may not be mounted in the current runtime environment.",
      "Run 4 slang normalization was tested but did not outperform Run 3."
    ],
    "warnings": []
  }
}
```

### Aspect Classify

Request:

```json
{
  "text": "Iklan terlalu banyak dan mengganggu.",
  "run_label": "demo"
}
```

Model response when the SVM artifact is available:

```json
{
  "success": true,
  "message": "Aspect classification completed.",
  "data": {
    "text": "Iklan terlalu banyak dan mengganggu.",
    "label": "Ads Experience",
    "confidence": null,
    "scores": {},
    "classifier_name": "merged_5class",
    "mode": "model",
    "prediction_source": "model",
    "model_name": "svm_merged_5class",
    "model_available": true,
    "is_fallback": false,
    "warnings": [
      "SVM aspect model does not expose predict_proba; confidence is not available."
    ]
  }
}
```

Fallback response when real SVM artifact loading is unavailable or inference fails:

```json
{
  "success": true,
  "message": "Aspect classification completed.",
  "data": {
    "text": "Iklan terlalu banyak dan mengganggu.",
    "label": "Ads Experience",
    "confidence": 0.76,
    "scores": {
      "Features, Content & Audio Experience": 0.06,
      "App Reliability & Usability": 0.06,
      "Ads Experience": 0.76,
      "Subscription & Pricing": 0.06,
      "Account/Login": 0.06
    },
    "classifier_name": "merged_5class",
    "mode": "fallback",
    "prediction_source": "fallback_keyword",
    "model_name": null,
    "model_available": false,
    "is_fallback": true,
    "warnings": [
      "SVM aspect model artifact is not available in this environment. Returning fallback keyword classification."
    ]
  }
}
```

Fallback mode is for service continuity only. It must not be interpreted as real SVM inference.

### Aspect Summary

Request:

```http
GET /aspects/summary
```

Response:

```json
{
  "success": true,
  "message": "Aspect summary loaded.",
  "data": {
    "selected_classifier": "merged_5class",
    "final_aspect_labels": [
      "Features, Content & Audio Experience",
      "App Reliability & Usability",
      "Ads Experience",
      "Subscription & Pricing",
      "Account/Login"
    ],
    "model_status": "available",
    "model_available": true,
    "model_name": "svm_merged_5class",
    "model_path_configured": true,
    "prediction_source": "model",
    "aspect_distribution": {
      "Features & Content": 7767,
      "Ads Experience": 4691,
      "Subscription & Pricing": 2840
    },
    "weak_label_limitation": "The SVM aspect classifier is trained and evaluated on weak labels derived from keyword-based aspect labeling. Therefore, the evaluation reflects the ability of the model to learn the weak-label aspect patterns, not expert-validated ground truth.",
    "warnings": []
  }
}
```

### Aspect Evaluation

Request:

```http
GET /aspects/evaluation
```

Response:

```json
{
  "success": true,
  "message": "Aspect evaluation loaded.",
  "data": {
    "selected_candidate": "merged_5class",
    "selected_metrics": {
      "accuracy": 0.9502074689,
      "f1_macro": 0.9367812077,
      "f1_weighted": 0.9501424836,
      "min_class_f1": 0.8898305085
    },
    "limitations": [
      "The SVM aspect classifier is trained and evaluated on weak labels derived from keyword-based aspect labeling. Therefore, the evaluation reflects the ability of the model to learn the weak-label aspect patterns, not expert-validated ground truth.",
      "Model artifact may not be mounted in the current runtime environment."
    ],
    "warnings": []
  }
}
```

### Report Summary

Request:

```http
GET /reports/summary
```

Response:

```json
{
  "success": true,
  "message": "Report summary loaded.",
  "data": {
    "project_name": "SentiRank",
    "application": "Spotify Google Play Reviews",
    "pipeline_status": {
      "data_acquisition": "available",
      "preprocessing": "available",
      "sentiment_modeling": "available",
      "aspect_classification": "available",
      "model_evaluation": "available",
      "ahp_fuzzy_ahp": "sample_development_only"
    },
    "selected_models": {
      "sentiment": "run_3_weighted_loss_lr_1e-5",
      "aspect": "merged_5class"
    },
    "final_criteria": [
      {
        "name": "App Reliability & Usability",
        "use_in_ahp": true
      }
    ],
    "demo_notes": [
      "Report service aggregates existing research outputs only.",
      "Final AHP/Fuzzy AHP priority ranking requires real expert judgement. Sample/development outputs are not final expert judgement and must not be interpreted as final Spotify improvement priorities."
    ],
    "warnings": []
  }
}
```

### Evaluation Summary

Request:

```http
GET /evaluation/summary
```

Response:

```json
{
  "success": true,
  "message": "Evaluation summary loaded.",
  "data": {
    "selected_indobert_model": "run_3_weighted_loss_lr_1e-5",
    "selected_svm_model": "merged_5class",
    "indobert_run_comparison": [],
    "svm_scenario_comparison": [],
    "final_aspect_criteria": [
      {
        "name": "Features, Content & Audio Experience",
        "use_in_ahp": true
      }
    ],
    "ahp_fuzzy_ahp_sample_status": {
      "status": "sample_development_only",
      "is_sample": true,
      "not_final_expert_judgement": true,
      "note": "Final AHP/Fuzzy AHP priority ranking requires real expert judgement. Sample/development outputs are not final expert judgement and must not be interpreted as final Spotify improvement priorities."
    },
    "warnings": []
  }
}
```

## Service Ownership Table

| Endpoint | Public gateway route | Internal service | Method | Responsibility | Frontend page/module consumer |
| --- | --- | --- | --- | --- | --- |
| `/ahp/criteria` | `/ahp/criteria` | `decision-service` | GET | Load final AHP criteria | AHP/Fuzzy AHP page |
| `/ahp/calculate` | `/ahp/calculate` | `decision-service` | POST | Calculate AHP weights | AHP/Fuzzy AHP page |
| `/ahp/fuzzy-calculate` | `/ahp/fuzzy-calculate` | `decision-service` | POST | Calculate Fuzzy AHP weights | AHP/Fuzzy AHP page |
| `/ahp/compare` | `/ahp/compare` | `decision-service` | POST | Compare AHP and Fuzzy AHP | AHP/Fuzzy AHP page |
| `/reviews/random` | `/reviews/random` | `review-service` | GET | Load random review samples | Dataset/review module |
| `/dataset/summary` | `/dataset/summary` | `review-service` | GET | Load dataset summary | Dataset module |
| `/scraping/summary` | `/scraping/summary` | `review-service` | GET | Load scraping summary | Dataset module |
| `/preprocessing/summary` | `/preprocessing/summary` | `review-service` | GET | Load preprocessing summary | Preprocessing module |
| `/sentiment/predict` | `/sentiment/predict` | `sentiment-service` | POST | Predict sentiment | Sentiment module |
| `/sentiment/summary` | `/sentiment/summary` | `sentiment-service` | GET | Load sentiment summary | Sentiment module |
| `/sentiment/evaluation` | `/sentiment/evaluation` | `sentiment-service` | GET | Load sentiment evaluation | Evaluation module |
| `/aspects/classify` | `/aspects/classify` | `aspect-service` | POST | Classify aspect | Aspect module |
| `/aspects/summary` | `/aspects/summary` | `aspect-service` | GET | Load aspect summary | Aspect module |
| `/aspects/evaluation` | `/aspects/evaluation` | `aspect-service` | GET | Load aspect evaluation | Evaluation module |
| `/reports/summary` | `/reports/summary` | `report-service` | GET | Load report summary | Report module |
| `/evaluation/summary` | `/evaluation/summary` | `report-service` | GET | Load consolidated evaluation summary | Evaluation module |
| `/inference/review` | `/inference/review` | `api-gateway-service` orchestrates `sentiment-service`, `aspect-service`, and runtime database | POST | Run sentiment/aspect inference for submitted review and persist history | Future runtime inference page |
| `/inference/history` | `/inference/history` | `api-gateway-service` + runtime database | GET | Load runtime user inference history | Future runtime inference page |
| `/inference/health` | `/inference/health` | `api-gateway-service` + runtime database | GET | Check runtime persistence and downstream inference readiness | System status |
| `/health` | `/health` | `api-gateway-service` | GET | Gateway health | System status |
| `/health/services` | `/health/services` | `api-gateway-service` | GET | Internal service health aggregation | System status |

## Error Handling Contract

### Validation Error

```json
{
  "success": false,
  "message": "Request validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "comparisons",
      "reason": "Expected 10 pairwise comparisons."
    }
  }
}
```

Runtime review inference input validation uses Bahasa Indonesia messages:

```json
{
  "success": false,
  "message": "Teks ulasan wajib diisi.",
  "data": null
}
```

### Internal Service Unavailable

```json
{
  "success": false,
  "message": "Internal service is unavailable.",
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "details": {
      "service": "decision-service"
    }
  }
}
```

If `sentiment-service` or `aspect-service` fails during `POST /inference/review`, the gateway returns an explicit error envelope. It does not calculate sentiment or aspect locally and does not invent replacement predictions.

### Gateway Timeout

```json
{
  "success": false,
  "message": "Gateway request timed out.",
  "error": {
    "code": "GATEWAY_TIMEOUT",
    "details": {
      "service": "sentiment-service",
      "timeout_seconds": 30
    }
  }
}
```

### Model Unavailable

```json
{
  "success": false,
  "message": "Requested model is unavailable.",
  "error": {
    "code": "MODEL_UNAVAILABLE",
    "details": {
      "model": "run_3_weighted_loss_lr_1e-5"
    }
  }
}
```

### Missing Dataset File

```json
{
  "success": false,
  "message": "Required dataset file was not found.",
  "error": {
    "code": "DATASET_FILE_MISSING",
    "details": {
      "path": "datasets/outputs/eda/01_data_acquisition/summary.json"
    }
  }
}
```

### Inconsistent AHP Judgement

```json
{
  "success": false,
  "message": "AHP judgement consistency ratio exceeds threshold.",
  "error": {
    "code": "AHP_INCONSISTENT_JUDGEMENT",
    "details": {
      "consistency_ratio": 0.18,
      "threshold": 0.1
    }
  }
}
```

## Versioning Strategy

The initial thesis implementation may use unversioned routes such as `/ahp/criteria`. A future production implementation can introduce versioned routes such as `/api/v1/ahp/criteria` without changing internal service boundaries.

## Frontend Integration Rules

- Frontend calls only the API Gateway.
- Frontend uses `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
- Frontend unwraps the Gateway response envelope.
- Frontend does not call internal service ports.
- Frontend does not calculate AHP or Fuzzy AHP directly.
- As of MS-10, the AHP/Fuzzy AHP page may run sample/development calculations through `/ahp/*` Gateway routes, but it must keep the sample-not-final expert judgement warning visible.

## Migration Notes

FE-13 currently connects the AHP/Fuzzy AHP page to a backend demo API. During microservice migration, the frontend contract should remain stable by routing the same public AHP/Fuzzy AHP paths through `api-gateway-service`.

The gateway will forward those routes to `decision-service`, so frontend code should only need the base API URL to point at `http://localhost:8000`.
