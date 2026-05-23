# AHP and Fuzzy AHP Design

This document defines the Phase 10A design for AHP and Fuzzy AHP in SentiRank. It prepares criteria and expert judgement templates only. AHP weights, Fuzzy AHP weights, and final rankings will be calculated in a later phase.

## Purpose

AHP is used to convert expert pairwise judgements into priority weights for improvement criteria. Fuzzy AHP is used as a comparison method because expert judgement can be uncertain, especially when criteria are close in perceived importance.

## Relationship To SVM Aspect Taxonomy

The selected SVM aspect classifier scenario is `merged_5class`. Its five actionable aspect classes become candidate AHP/Fuzzy AHP criteria:

1. Features, Content & Audio Experience
2. App Reliability & Usability
3. Ads Experience
4. Subscription & Pricing
5. Account/Login

The `General` fallback class is not used as an AHP criterion because it is not actionable enough for expert weighting or improvement prioritization.

## Why Expert Judgement Is Required

The SVM aspect classifier was trained and evaluated on weak labels derived from keyword-based aspect labeling. These labels are useful for exploratory modeling, but they are not expert-validated ground truth. Expert judgement is required to validate the criteria and provide pairwise importance assessments before final weighting.

## AHP Pairwise Comparison

With 5 criteria, the expert template contains 10 pairwise comparisons: `5(5-1)/2 = 10`.

The AHP template uses Saaty's scale:

| Value | Meaning |
| --- | --- |
| 1 | Equal importance |
| 3 | Moderate importance |
| 5 | Strong importance |
| 7 | Very strong importance |
| 9 | Extreme importance |
| 2, 4, 6, 8 | Intermediate values |

For each comparison:

- If `criterion_a` is preferred, `ahp_value_a_over_b = intensity_saaty`.
- If `criterion_b` is preferred, `ahp_value_a_over_b = 1 / intensity_saaty`.
- If both criteria are equal, `ahp_value_a_over_b = 1`.

Consistency must be checked in the later calculation phase. The acceptable consistency ratio threshold is `CR <= 0.10`. If `CR > 0.10`, the response should either be revised by the expert or documented and excluded/flagged as inconsistent.

## Fuzzy AHP Pairwise Comparison

Fuzzy AHP uses triangular fuzzy numbers to represent uncertainty in linguistic judgement:

| Linguistic scale | TFN `(l, m, u)` |
| --- | --- |
| equal | `(1, 1, 1)` |
| moderate | `(2, 3, 4)` |
| strong | `(4, 5, 6)` |
| very_strong | `(6, 7, 8)` |
| extreme | `(8, 9, 9)` |

If `criterion_b` is preferred over `criterion_a`, the reciprocal triangular fuzzy number is used: `(1/u, 1/m, 1/l)`.

## Output Policy

Phase 10A creates only criteria definitions and blank expert judgement templates under `docs/templates/ahp/`. Final AHP weights, Fuzzy AHP weights, and ranking outputs must not be created in this phase.
