# Model Evaluation Summary

SentiRank uses separate models for separate tasks. IndoBERT is used for sentiment classification because it is better suited to contextual Indonesian review text. SVM is used for aspect classification because the aspect labels come from a controlled weak-label taxonomy and TF-IDF style features remain interpretable for thesis analysis.

The selected canonical IndoBERT candidate is `run_3_weighted_loss_lr_1e-5`. It had the strongest completed trade-off among the recorded runs: highest Macro F1 (0.7310), highest Weighted F1 (0.7666), and the best Neutral F1 (0.5775). Run 4 tested conservative slang normalization, but it did not outperform Run 3.

The model was retrained on the canonical dataset (96,534 clean rows) after MS-15D text quality filtering. Metrics below reflect the latest canonical retrained artifact.

| Metric | Pre-canonical (noisy 97,782 rows) | Canonical retrain (96,534 rows) | Delta |
|--------|----------------------------------|--------------------------------|-------|
| Accuracy | 0.7362 | **0.7609** | +0.0247 |
| Macro F1 | 0.7093 | **0.7310** | +0.0217 |
| Weighted F1 | 0.7445 | **0.7666** | +0.0221 |
| Neutral F1 | 0.5562 | **0.5775** | +0.0213 |
| Test loss | 0.6657 | **0.6281** | -0.0377 |

The selected SVM aspect classifier is `merged_5class`. It improves accuracy, Macro F1, Weighted F1, and minority-class stability compared with the exploratory `original_7class` baseline. The merged taxonomy is also more practical for AHP/Fuzzy AHP because it reduces pairwise comparison burden while preserving actionable criteria.

The SVM model was retrained on the canonical aspect dataset (96,534 rows, MS-16C/D). Metrics below reflect the latest canonical retrained artifact.

| Metric | Pre-canonical (historical) | Canonical retrain | Delta |
|--------|---------------------------|-------------------|-------|
| Accuracy | 0.9502 | **0.9506** | +0.0004 |
| Macro F1 | 0.9368 | **0.9404** | +0.0036 |
| Weighted F1 | 0.9501 | **0.9505** | +0.0004 |

Macro F1 is important because both sentiment and aspect labels are imbalanced. Accuracy alone would overstate model quality when minority classes, especially Neutral sentiment or smaller aspect classes, are weaker.

The SVM result has a key limitation: it is trained and evaluated on weak labels derived from keyword-based aspect labeling, not expert-validated ground truth. The final five aspect criteria should therefore be treated as candidate criteria for AHP/Fuzzy AHP and validated through expert judgement before final priority weighting.
