# MS-16A — Model Retraining Decision

Generated: 2026-06-24
Milestone: MS-16A
Author: Automated audit

---

## Decision: `RETRAIN REQUIRED` (both models)

---

## 1. IndoBERT — Sentiment Classification

### Current artifact

| Field | Value |
|-------|-------|
| Run name | `run_3_weighted_loss_lr_1e-5` |
| Base model | `indobenchmark/indobert-base-p1` |
| Saved artifact | `ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5/` (`model.safetensors` = 475 MB) |
| Training date | 2026-06-18 |
| Source | Colab (Google Drive path in training_config.json) |

### Recorded metrics (old split)

| Metric | Value |
|--------|-------|
| Accuracy | 0.7577 |
| F1 macro | 0.7284 |
| F1 weighted | 0.7634 |
| Test rows | 14,668 |

### Lineage evidence

| Item | Old training data | New canonical data | Delta |
|------|-------------------|--------------------|-------|
| **Source file** | `datasets/processed/reviews_final.csv` (noisy) | `datasets/processed/dataset_spotify_processed.csv` (filtered) | Clean source changed |
| **Total rows** | 97,782 | 96,534 | **1,248 noisy rows removed** |
| **Train rows** | 68,446 | 67,573 | −873 |
| **Validation rows** | 14,668 | 14,480 | −188 |
| **Test rows** | 14,668 | 14,481 | −187 |
| **Negative distribution (train)** | 40.59% | 40.83% | +0.24 pp |
| **Neutral distribution (train)** | 18.03% | 17.91% | −0.12 pp |
| **Positive distribution (train)** | 41.38% | 41.27% | −0.12 pp |

### Finding

- The model **was trained** on the old unfiltered splits generated from `reviews_final.csv` (97,782 rows).
- The metric JSON explicitly records `input_dataset_path: "datasets/processed/reviews_final.csv"` and `test_rows: 14668`.
- After MS-15D, the same paths (`datasets/processed/indobert/{train,validation,test}.csv`) now contain **regenerated canonical splits** (96,534 rows) with clean text from the filtered dataset.
- The 1,248 removed rows included confirmed gibberish (emoji-only, Morse-like, high-symbol/digit, repeated-garbage). The distribution shift is minimal (<0.25 pp per class), but the **training data has changed**.
- The artifact's `eval_metrics.json` itself notes: *"Metrics are from this Colab run... retraining required if processed dataset regenerated"*.

### Verdict

**RETRAIN REQUIRED** — The model was trained on noisy 97,782-row splits. The canonical 96,534-row splits exist and are verified clean. The same hyperparameters (`run_3_weighted_loss_lr_1e-5`) should be re-trained on the canonical splits to produce valid metrics.

Cannot evaluate locally: `torch` is not installed in the project virtual environment (Docker-only dependency).

---

## 2. SVM — Aspect Classification

### Current artifact

| Field | Value |
|-------|-------|
| Scenario | `merged_5class` |
| Saved artifact | `ml-service/saved_models/svm/svm_merged_5class_pipeline.joblib` |
| Training date | 2026-05-23 |

### Recorded metrics (old split)

| Metric | Value |
|--------|-------|
| Accuracy | 0.9502 |
| F1 macro | 0.9368 |
| F1 weighted | 0.9501 |
| Test rows | 2,410 |

### Lineage evidence

| Item | Old training data | New canonical data | Delta |
|------|-------------------|--------------------|-------|
| **Source file** | `datasets/processed/reviews_with_aspect_labels_refined.csv` (unfiltered branch) | `datasets/processed/dataset_spotify_processed.csv` (filtered) has no aspect labels | Labels need regeneration |
| **Weak-label pipeline** | `reviews_final.csv` → `label_aspects_by_keywords.py` → refined labels | Not yet executed against canonical input | Whole pipeline stale |
| **SVM dataset** | `datasets/processed/svm/svm_aspect_dataset.csv` (16,983 rows) | Not regenerated | N/A |
| **Non-canonical IDs** | 6 IDs in SVM dataset are NOT in canonical `dataset_spotify_processed.csv` | N/A | Contamination |

### Finding

- The SVM pipeline has **two levels of lineage drift**:
  1. The aspect labels were derived from `reviews_final.csv` (noisy, 97,782 rows), which includes rows that the quality filter later removed.
  2. The SVM training dataset (`svm_aspect_dataset.csv`, 16,983 rows) contains **6 IDs that do not exist** in the canonical `dataset_spotify_processed.csv`.
- The weak-label regeneration pipeline (`label_aspects_by_keywords.py`) has NOT been run on canonical input.
- The data-artifact-lineage-audit.md (MS-15D) documented SVM as `NEEDS VERIFICATION`.
- Unlike IndoBERT where the split files were regenerated in-place, SVM splits still point to the old non-canonical lineage.

### Verdict

**RETRAIN REQUIRED** — The SVM model was trained on a dataset that:
1. Derives from the unfiltered 97,782-row branch.
2. Contains at least 6 rows not present in the canonical dataset.
3. Uses weak labels that have not been regenerated from canonical input.

Cannot evaluate locally: no eval-only script exists for SVM; `joblib` can load the pipeline but evaluation requires the full sklearn pipeline and test split.

---

## 3. Recommendation

| Model | Decision | Priority | Action required |
|-------|----------|----------|-----------------|
| **IndoBERT** | **RETRAIN REQUIRED** | High | Re-train `run_3_weighted_loss_lr_1e-5` config on canonical `datasets/processed/indobert/{train,validation,test}.csv` (MS-15D splits). |
| **SVM** | **RETRAIN REQUIRED** | High | (1) Regenerate weak aspect labels from canonical `dataset_spotify_processed.csv` using `label_aspects_by_keywords.py`. (2) Regenerate `svm_aspect_dataset.csv` from canonical-labeled data. (3) Re-train `merged_5class` scenario. |

### Sequence

1. **IndoBERT retrain first** — splits already exist, training config is defined, Colab workflow is documented.
2. **SVM after weak-label regeneration** — need to first run the labeling pipeline on canonical data, then prepare dataset, then retrain.

### Open items

- Local environment lacks `torch` and full IndoBERT inference dependencies → evaluation on canonical test split deferred to retraining step.
- No eval-only script exists for either model → evaluation is always coupled with training.
- The 6 non-canonical IDs in SVM dataset should be investigated during weak-label regeneration; they may indicate preprocessing pipeline mismatch.
