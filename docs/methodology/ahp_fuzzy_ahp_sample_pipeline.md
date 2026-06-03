# AHP and Fuzzy AHP Sample Pipeline

Phase 10C adds an operational sample pipeline for testing the AHP, Fuzzy AHP, and ranking-comparison calculation flow in SentiRank. The pipeline uses development-only pairwise judgement files and the backend calculation services created in Phase 10B.

## Purpose

The sample pipeline verifies that expert judgement templates can be converted into calculation requests, processed by the backend services, exported as metrics, and compared between AHP and Fuzzy AHP. It is a technical validation step before real expert judgement is collected.

## Sample-Only Policy

All Phase 10C generated outputs are marked with:

- `run_label: sample_development_only`
- `is_sample: true`
- `not_final_expert_judgement: true`

These outputs are not final AHP weights, not final Fuzzy AHP weights, and not thesis ranking results. They must not be interpreted as expert judgement.

## Input Files

Sample pairwise judgement files are stored under:

- `docs/templates/ahp/sample_development/ahp_pairwise_sample_development.csv`
- `docs/templates/ahp/sample_development/fuzzy_ahp_pairwise_sample_development.csv`

The sample files use the final five candidate criteria from Phase 10A and contain exactly 10 pairwise comparisons.

## Reusable Scripts

The same scripts can later be reused with real expert judgement files by passing explicit input paths:

- `ml-service/scripts/calculate_ahp_from_expert_judgement.py`
- `ml-service/scripts/calculate_fuzzy_ahp_from_expert_judgement.py`
- `ml-service/scripts/compare_ahp_fuzzy_outputs.py`

The scripts call the existing backend services directly rather than duplicating AHP or Fuzzy AHP mathematics.

## Real Expert Judgement Requirement

Final AHP and Fuzzy AHP outputs still require validated expert pairwise comparisons. Real expert responses should be checked for completeness, consistency, and documentation quality before final weights or rankings are generated.

## Later Phase

A later phase will use real expert judgement files to generate final AHP weights, final Fuzzy AHP weights, priority rankings, and AHP-vs-Fuzzy AHP comparison outputs.
