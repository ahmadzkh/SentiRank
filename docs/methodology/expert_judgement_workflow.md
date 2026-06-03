# Expert Judgement Workflow

Phase 10D prepares the expert judgement intake workflow for SentiRank. It validates and aggregates AHP and Fuzzy AHP pairwise comparison files before any final AHP/Fuzzy AHP calculation is run.

## Collection

Future expert judgement files should be placed manually under:

`docs/templates/ahp/expert_judgement_input/`

Experts should use respondent codes rather than sensitive personal data when privacy is preferred. The same `respondent_id` should be used consistently across AHP and Fuzzy AHP files.

## Sample vs Final Judgement

Files under `docs/templates/ahp/sample_development/` are development samples only. They are useful for validating scripts and notebook workflow, but they are not final expert judgement and must not be used as thesis ranking results.

Final calculations should only use real expert judgement files that pass validation.

## Expected AHP Format

Each AHP file must include:

- `respondent_id`
- `respondent_role`
- `comparison_id`
- `criterion_a`
- `criterion_b`
- `preferred_criterion`
- `intensity_saaty`
- `ahp_value_a_over_b`
- `justification`

Each respondent must provide exactly 10 comparisons for the 5 criteria. The AHP value must be consistent with the preference rule:

- `equal`: `ahp_value_a_over_b = 1`
- `criterion_a`: `ahp_value_a_over_b = intensity_saaty`
- `criterion_b`: `ahp_value_a_over_b = 1 / intensity_saaty`

## Expected Fuzzy AHP Format

Each Fuzzy AHP file must include:

- `respondent_id`
- `respondent_role`
- `comparison_id`
- `criterion_a`
- `criterion_b`
- `preferred_criterion`
- `linguistic_scale`
- `fuzzy_l`
- `fuzzy_m`
- `fuzzy_u`
- `fuzzy_value_a_over_b`
- `justification`

The triangular fuzzy number must satisfy `fuzzy_l > 0`, `fuzzy_m > 0`, `fuzzy_u > 0`, and `fuzzy_l <= fuzzy_m <= fuzzy_u`.

## Validation Rules

Validation checks:

- exactly 5 criteria from the final criteria file
- exactly 10 comparisons per respondent
- each expected pair appears once per respondent
- no unknown criteria
- no duplicate pair per respondent
- complete and valid comparison values
- valid AHP Saaty values or valid Fuzzy AHP triangular fuzzy numbers

Validation outputs are written under:

- `datasets/outputs/eda/06_ahp/validation/`
- `datasets/outputs/eda/07_fuzzy_ahp/validation/`

## Consistency Requirement

Final expert judgement should later be checked through AHP consistency ratio. The target threshold is `CR <= 0.10`. If judgement is inconsistent, the response should be reviewed, revised, flagged, or excluded according to thesis methodology.

## Multi-Expert Aggregation

When multiple expert responses are valid, pairwise judgements are aggregated before final calculation.

AHP uses geometric mean aggregation for `ahp_value_a_over_b`. This is standard for group AHP because it preserves reciprocal pairwise comparison behavior better than arithmetic mean.

Fuzzy AHP uses component-wise geometric mean for `fuzzy_l`, `fuzzy_m`, and `fuzzy_u`, then validates that the aggregated TFN still satisfies `l <= m <= u`.

Aggregation outputs are written under:

- `datasets/outputs/eda/06_ahp/aggregated/`
- `datasets/outputs/eda/07_fuzzy_ahp/aggregated/`

## Later Phase

Final AHP weights, Fuzzy AHP weights, and priority rankings will be generated only after valid expert judgement data is available and aggregation has passed validation.
