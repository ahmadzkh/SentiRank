# AHP and Fuzzy AHP API Contract

This document describes the backend calculation endpoints for SentiRank AHP, Fuzzy AHP, and ranking comparison. The frontend must call these backend endpoints for calculations and must not calculate AHP or Fuzzy AHP directly.

All successful responses follow the existing ML service wrapper:

```json
{
  "success": true,
  "message": "Operation message.",
  "data": {}
}
```

Validation errors return HTTP `422` with a clear error detail.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/ahp` | Legacy AHP boundary/status endpoint. |
| `GET` | `/ahp/criteria` | Return the final 5 Phase 10A criteria. |
| `POST` | `/ahp/calculate` | Calculate AHP weights and consistency ratio. |
| `POST` | `/ahp/fuzzy-calculate` | Calculate Fuzzy AHP weights and modal consistency ratio. |
| `POST` | `/ahp/compare` | Compare AHP and Fuzzy AHP weights/ranks. |

## Criteria Response

```json
{
  "success": true,
  "message": "AHP/Fuzzy AHP criteria are ready.",
  "data": [
    {
      "id": "C1",
      "name": "Features, Content & Audio Experience",
      "description": "Issues or improvement priorities related to music/content availability, playlist, lyrics, shuffle, download, podcast, recommendations, and audio listening experience."
    }
  ]
}
```

## AHP Calculation

Request:

```json
{
  "run_label": "expert_batch_1",
  "criteria": [
    { "id": "C1", "name": "Features, Content & Audio Experience" },
    { "id": "C2", "name": "App Reliability & Usability" },
    { "id": "C3", "name": "Ads Experience" },
    { "id": "C4", "name": "Subscription & Pricing" },
    { "id": "C5", "name": "Account/Login" }
  ],
  "comparisons": [
    { "criterion_a": "C1", "criterion_b": "C2", "value_a_over_b": 3 },
    { "criterion_a": "C1", "criterion_b": "C3", "value_a_over_b": 5 },
    { "criterion_a": "C1", "criterion_b": "C4", "value_a_over_b": 2 },
    { "criterion_a": "C1", "criterion_b": "C5", "value_a_over_b": 4 },
    { "criterion_a": "C2", "criterion_b": "C3", "value_a_over_b": 3 },
    { "criterion_a": "C2", "criterion_b": "C4", "value_a_over_b": 2 },
    { "criterion_a": "C2", "criterion_b": "C5", "value_a_over_b": 4 },
    { "criterion_a": "C3", "criterion_b": "C4", "value_a_over_b": 0.5 },
    { "criterion_a": "C3", "criterion_b": "C5", "value_a_over_b": 2 },
    { "criterion_a": "C4", "criterion_b": "C5", "value_a_over_b": 3 }
  ],
  "consistency_threshold": 0.1
}
```

Response excerpt:

```json
{
  "success": true,
  "message": "AHP calculation completed.",
  "data": {
    "method": "AHP",
    "run_label": "expert_batch_1",
    "criteria_count": 5,
    "pairwise_matrix": [[1, 3, 5, 2, 4]],
    "weights": [
      {
        "criterion_id": "C1",
        "criterion_name": "Features, Content & Audio Experience",
        "weight": 0.35,
        "rank": 1
      }
    ],
    "lambda_max": 5.12,
    "consistency_index": 0.03,
    "consistency_ratio": 0.027,
    "consistency_threshold": 0.1,
    "is_consistent": true,
    "warnings": []
  }
}
```

## Fuzzy AHP Calculation

Request:

```json
{
  "run_label": "expert_batch_1",
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
      "linguistic_scale": "moderate",
      "fuzzy_value_a_over_b": { "l": 2, "m": 3, "u": 4 }
    }
  ],
  "defuzzification_method": "centroid",
  "consistency_threshold": 0.1
}
```

The request must include all `n(n-1)/2` comparisons. For 5 criteria, that means 10 comparisons.

Response excerpt:

```json
{
  "success": true,
  "message": "Fuzzy AHP calculation completed.",
  "data": {
    "method": "Fuzzy AHP",
    "run_label": "expert_batch_1",
    "criteria_count": 5,
    "fuzzy_pairwise_matrix": [
      [
        { "l": 1, "m": 1, "u": 1 },
        { "l": 2, "m": 3, "u": 4 }
      ]
    ],
    "modal_crisp_matrix": [[1, 3]],
    "weights": [
      {
        "criterion_id": "C1",
        "criterion_name": "Features, Content & Audio Experience",
        "fuzzy_weight": { "l": 0.2, "m": 0.3, "u": 0.4 },
        "defuzzified_weight": 0.3,
        "normalized_weight": 0.32,
        "rank": 1
      }
    ],
    "consistency_ratio_modal": 0.03,
    "consistency_threshold": 0.1,
    "is_consistent_modal": true,
    "defuzzification_method": "centroid",
    "warnings": []
  }
}
```

## Ranking Comparison

Request:

```json
{
  "run_label": "expert_batch_1",
  "ahp_weights": [
    {
      "criterion_id": "C1",
      "criterion_name": "Features, Content & Audio Experience",
      "weight": 0.35,
      "rank": 1
    }
  ],
  "fuzzy_ahp_weights": [
    {
      "criterion_id": "C1",
      "criterion_name": "Features, Content & Audio Experience",
      "fuzzy_weight": { "l": 0.2, "m": 0.3, "u": 0.4 },
      "defuzzified_weight": 0.3,
      "normalized_weight": 0.32,
      "rank": 1
    }
  ]
}
```

Response excerpt:

```json
{
  "success": true,
  "message": "AHP and Fuzzy AHP comparison completed.",
  "data": {
    "run_label": "expert_batch_1",
    "items": [
      {
        "criterion_id": "C1",
        "criterion_name": "Features, Content & Audio Experience",
        "ahp_weight": 0.35,
        "fuzzy_ahp_weight": 0.32,
        "ahp_rank": 1,
        "fuzzy_ahp_rank": 1,
        "weight_delta": -0.03,
        "rank_delta": 0
      }
    ],
    "summary": {
      "total_criteria": 5,
      "max_absolute_weight_delta": 0.03,
      "changed_rank_count": 0,
      "identical_top_rank": true
    },
    "warnings": []
  }
}
```

## Methodology Notes

- AHP uses row geometric means and consistency ratio with Saaty's Random Index.
- Fuzzy AHP uses triangular fuzzy numbers, fuzzy geometric means, centroid defuzzification, and a modal crisp consistency ratio.
- These endpoints do not persist final thesis rankings automatically.
- Final expert judgement and ranking outputs should be generated only after validated expert input is available.
