# Expert Judgement Input Folder

Place future filled expert judgement CSV files in this folder manually.

## Expected Files

- Filled AHP pairwise comparison files based on `docs/templates/ahp/ahp_pairwise_template.csv`
- Filled Fuzzy AHP pairwise comparison files based on `docs/templates/ahp/fuzzy_ahp_pairwise_template.csv`

## Rules

- Sample/development files are not final expert judgement.
- Use `respondent_id` consistently across AHP and Fuzzy AHP files.
- Each respondent must provide exactly 10 pairwise comparisons for the 5 criteria.
- Do not place sensitive personal data here. Use respondent codes if privacy is preferred.
- Validation must pass before aggregation or final calculation is attempted.

Final AHP/Fuzzy AHP weights and rankings are not generated from this folder until validated expert judgement data is available.
