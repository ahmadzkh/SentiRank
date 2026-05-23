# SVM Aspect Classifier Finalization

SentiRank uses SVM for aspect classification only. Sentiment classification is handled by the selected IndoBERT candidate, `run_3_weighted_loss_lr_1e-5`.

Two SVM scenarios were evaluated: the exploratory `original_7class` baseline and the `merged_5class` taxonomy. The merged scenario is selected because it improves accuracy, macro F1, weighted F1, macro recall, and minimum class F1 while reducing the instability caused by sparse `UI/UX` and `Audio Quality` classes.

The selected candidate criteria are:

- Features, Content & Audio Experience
- App Reliability & Usability
- Ads Experience
- Subscription & Pricing
- Account/Login

These labels are weak labels derived from keyword-based aspect labeling. The evaluation reflects the model's ability to learn weak-label patterns, not expert-validated ground truth. The selected criteria are candidates for AHP/Fuzzy AHP and still require expert judgement validation before final pairwise weighting.
