# Model Evaluation Summary

SentiRank uses separate models for separate tasks. IndoBERT is used for sentiment classification because it is better suited to contextual Indonesian review text. SVM is used for aspect classification because the aspect labels come from a controlled weak-label taxonomy and TF-IDF style features remain interpretable for thesis analysis.

The selected historical IndoBERT candidate is `run_3_weighted_loss_lr_1e-5`. It had the strongest completed trade-off among the recorded runs: highest Macro F1, highest Weighted F1, and the best Neutral F1. Run 4 tested conservative slang normalization, but it did not outperform Run 3.

Because text quality filtering has since been strengthened, the recorded run_3 metrics must be treated as historical evidence until the same run_3 configuration is re-trained and evaluated on the regenerated processed IndoBERT dataset. The artifact export workflow is documented in `docs/ml/indobert-artifact-export.md`.

The selected SVM aspect classifier is `merged_5class`. It improves accuracy, Macro F1, Weighted F1, and minority-class stability compared with the exploratory `original_7class` baseline. The merged taxonomy is also more practical for AHP/Fuzzy AHP because it reduces pairwise comparison burden while preserving actionable criteria.

Macro F1 is important because both sentiment and aspect labels are imbalanced. Accuracy alone would overstate model quality when minority classes, especially Neutral sentiment or smaller aspect classes, are weaker.

The SVM result has a key limitation: it is trained and evaluated on weak labels derived from keyword-based aspect labeling, not expert-validated ground truth. The final five aspect criteria should therefore be treated as candidate criteria for AHP/Fuzzy AHP and validated through expert judgement before final priority weighting.
