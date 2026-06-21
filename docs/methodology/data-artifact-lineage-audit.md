# MS-15A Data Artifact Lineage Audit

Audit date: 2026-06-20

MS-15B promotion update: 2026-06-21

Scope: read-only inventory and lineage analysis. No dataset, script, notebook, service, frontend, Docker, model, or environment file was modified.

## 1. Executive Summary

SentiRank currently has two competing processed-data branches:

1. The active repository branch under `datasets/processed/` contains the files used by dataset preparation and backend review APIs.
2. A later quality-filtered branch under `ml-service/quality_audit/` contains explicit row-level quality metadata, dropped-row reports, and a cleaner final dataset, but it is not consumed by active preparation scripts or backend services through its current path.

MS-15B promoted `ml-service/quality_audit/reviews_final_quality_filtered.csv` into `datasets/processed/dataset_spotify_processed.csv` and `.json`. Both canonical files contain `96,534` valid rows after `1,207` IndoBERT-stage drops and `41` additional SVM-stage drops. The canonical CSV is byte-identical to its promotion source. Active readers are intentionally unchanged until later milestones.

The current `datasets/processed/reviews_final.csv` is not a clean source of truth despite its name. Targeted samples confirm it still contains an emoji-only row and a Morse-like row. The Morse-like row also appears in `datasets/processed/indobert/test.csv`, proving that the current IndoBERT splits were generated from the unfiltered `97,782`-row branch. `datasets/outputs/eda/03_indobert/indobert_dataset_summary.json` confirms `preprocessing_status_rows_removed: 0` and `valid_rows: 97,782`.

No files should be deleted in the next step. MS-15B should promote a verified canonical processed dataset first, preserve row-level provenance, then update readers and regenerate model-specific datasets before any archive/removal milestone.

### Decision Summary

| Question | Finding | Confidence |
| --- | --- | --- |
| Canonical clean processed dataset | `datasets/processed/dataset_spotify_processed.{csv,json}` sourced from `ml-service/quality_audit/reviews_final_quality_filtered.csv` | Confirmed by MS-15B validation |
| Misleading noisy `final` file | `datasets/processed/reviews_final.csv` | Confirmed by targeted samples |
| Current IndoBERT preparation input | `datasets/processed/reviews_final.csv` -> `datasets/processed/indobert/{train,validation,test}.csv` | Confirmed by defaults and generated summary |
| Current SVM preparation input | `datasets/processed/reviews_with_aspect_labels_refined.csv` -> `datasets/processed/svm/svm_aspect_dataset.csv` | Confirmed by defaults |
| Backend review sample source | Random: `reviews_final.csv`; latest negative: refined aspect labels first | Confirmed by service code |
| Quality-filtered branch consumer | No committed consumer of the three `*_quality_filtered.csv` files | Confirmed by repository search |
| Frontend data source | API Gateway only; indirect dependency on backend artifacts | Confirmed by frontend service modules |

## 2. Current Data Artifact Problem

The word `final` currently means several different things:

- `reviews_final.csv` means a compact preprocessing output, not a verified noise-free canonical dataset.
- `reviews_with_aspect_labels_refined.csv` means refined weak aspect labels, but it inherits rows from `reviews_final.csv`.
- IndoBERT `run_3_weighted_loss_lr_1e-5` is the selected historical experiment, but its current split lineage still points to the unfiltered processed branch.
- SVM `merged_5class` is the selected taxonomy/model, but its preparation source also descends from the unfiltered branch.
- AHP/Fuzzy AHP files with `sample_development` are pipeline-validation outputs, not final expert-judgement results.

The quality-filtering implementation is newer than the active processed-data contract. It produced a valid-row branch and explicit noise reports under `ml-service/quality_audit/`, but those paths were never promoted into `datasets/processed/`. As a result:

- scripts and notebooks still name `reviews_final.csv` as the main processed input;
- `review-service` serves samples from the noisy file;
- backend preprocessing/sentiment summaries report the pre-filter `97,782` rows;
- current IndoBERT splits include rows identified by the audit as noise;
- frontend tables ask review sample APIs for fields that the API schema does not return.

## 3. Dataset Artifact Inventory

### 3.1 Inventory Method and Legend

The audit enumerated `173` CSV/JSON artifacts without loading large files in full.

| Root | CSV/JSON count |
| --- | ---: |
| `datasets/raw/` | 14 |
| `datasets/processed/` | 12 |
| `datasets/outputs/` | 136 |
| `ml-service/quality_audit/` | 11 |

Large CSVs were inspected only through file size, header reads, small targeted samples, existing summary JSON, and targeted ID/pattern searches. Model binaries were not inspected. `ml-service/saved_models/` was only confirmed to exist and is unrelated to dataset lineage except as a downstream trained-artifact destination.

Reference notation:

- `R`: read by code/notebook/service.
- `W`: written by code or a documented notebook command.
- `API`: directly read by a backend service and exposed indirectly to frontend.
- `DOC`: documentation-only reference.
- `NONE`: no committed reader found.

Rows below group files only when every named file has the same lineage classification. Every audited CSV/JSON path is enumerated.

### 3.2 Raw Acquisition Artifacts

| Path(s) | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `datasets/raw/app_info_spotify.json` | raw metadata | Spotify application metadata | Canonical acquisition metadata; no text-noise concern | W `scrape_reviews.py`; API `review-service` | KEEP |
| `datasets/raw/reviews_rating_1_raw.csv`<br>`datasets/raw/reviews_rating_2_raw.csv`<br>`datasets/raw/reviews_rating_3_raw.csv`<br>`datasets/raw/reviews_rating_4_raw.csv`<br>`datasets/raw/reviews_rating_5_raw.csv` | raw | Per-rating scraped reviews | Canonical immutable raw inputs; may contain natural raw noise by design | W/R `scrape_reviews.py`; R `label_by_rating.py`; DOC/notebook `01_data_acquisition.ipynb` | KEEP |
| `datasets/raw/scraping_state_rating_1.json`<br>`datasets/raw/scraping_state_rating_2.json`<br>`datasets/raw/scraping_state_rating_3.json`<br>`datasets/raw/scraping_state_rating_4.json`<br>`datasets/raw/scraping_state_rating_5.json` | raw state | Resume/cursor state per rating | Operational acquisition state, not training data | R/W `scrape_reviews.py` | KEEP |
| `datasets/raw/scraping_summary.json` | acquisition output | Scraping execution and quota summary | Canonical acquisition summary, but contains internal relative output paths | W `scrape_reviews.py`; API `review-service` | KEEP |
| `datasets/raw/reviews_raw_labeled.csv` | raw labeled | Concatenated raw reviews with rating-derived initial sentiment | Canonical labeled raw input; still contains raw noise by design | W `label_by_rating.py`; R `relabel_by_keywords.py`; API fallback and author lookup in `review-service` | KEEP |
| `datasets/raw/data_acquisition_summary.json` | acquisition output | `97,782`-row acquisition statistics | Canonical summary for the raw snapshot | W `label_by_rating.py`; API `review-service` | KEEP |

### 3.3 Processed and Model-Specific Artifacts

| Path | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `datasets/processed/reviews_relabelled.csv` | processed intermediate | Keyword sentiment relabeling output (`97,782` rows) | Intermediate; confirmed to contain Morse-like/raw noise because quality filtering occurs later | W `relabel_by_keywords.py`; R `preprocess_indobert.py`; notebook 02 | INTERMEDIATE |
| `datasets/processed/reviews_preprocessed_indobert.csv` | processed intermediate | Older IndoBERT text-cleaning output | Unfiltered legacy branch; sampled audit-dropped IDs remain present | W `preprocess_indobert.py`; R `preprocess_svm.py`; notebook 02 | LEGACY |
| `datasets/processed/reviews_preprocessed_indobert.json` | processed duplicate | Large JSON serialization of an older IndoBERT preprocessing result | No committed reader found; duplicates CSV-era content and may contain the same noise | NONE | ARCHIVE LATER |
| `datasets/processed/reviews_preprocessed_svm.csv` | processed intermediate | Older SVM text-cleaning output | Unfiltered legacy branch; emoji/noise rows remain | W `preprocess_svm.py`; no independent downstream reader found outside notebook lineage | LEGACY |
| `datasets/processed/reviews_final.csv` | processed output | Compact combined sentiment preprocessing output | Misleading name; confirmed emoji-only and Morse-like rows. No quality metadata columns | W `preprocess_svm.py`; R `prepare_indobert_dataset.py`, `train_indobert.py` metadata, notebook 02, `review-service` | LEGACY; NOT SAFE TO DELETE |
| `datasets/processed/reviews_with_aspect_labels.csv` | processed output | Earlier weak aspect-label output | Derived from noisy `reviews_final.csv`; older than refined output | API fallback for latest negatives; no current writer command found | LEGACY; NOT SAFE TO DELETE |
| `datasets/processed/reviews_with_aspect_labels_refined.csv` | processed output | Refined weak aspect labels and confidence | Active SVM preparation source, but inherits unfiltered upstream rows | W `label_aspects_by_keywords.py`; R `prepare_svm_aspect_dataset.py`; preferred API latest-negative source | NEEDS DECISION |
| `datasets/processed/indobert/train.csv` | split | IndoBERT train split | Active derived split; generated from `97,782` unfiltered rows; a quality-audit-dropped ID is present | W `prepare_indobert_dataset.py`; R `train_indobert.py`, Colab notebooks | NEEDS DECISION |
| `datasets/processed/indobert/validation.csv` | split | IndoBERT validation split | Active derived split; same unfiltered lineage | W `prepare_indobert_dataset.py`; R `train_indobert.py`, Colab notebooks | NEEDS DECISION |
| `datasets/processed/indobert/test.csv` | split | IndoBERT test split | Active derived split; confirmed to contain the Morse-like ID `1b2b73e6-...` | W `prepare_indobert_dataset.py`; R `train_indobert.py`, Colab notebooks | NEEDS DECISION |
| `datasets/processed/indobert/label_mapping.json` | split metadata | Sentiment label-to-ID mapping | Valid derived metadata; must be regenerated/versioned with new splits | W `prepare_indobert_dataset.py`; R training/Colab/export | KEEP |
| `datasets/processed/svm/svm_aspect_dataset.csv` | processed model dataset | Filtered weak-label aspect dataset (`16,983` rows in current summary) | Active derived dataset from old refined labels; noise impact is inherited and needs regeneration | W `prepare_svm_aspect_dataset.py`; R `train_svm_aspect_classifier.py` | NEEDS DECISION |

### 3.4 Quality-Audit Artifacts

| Path | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `ml-service/quality_audit/reviews_preprocessed_indobert_quality_filtered.csv` | audit / processed | Valid rows after IndoBERT-stage quality filtering (`96,575`) with row-level provenance | Strong intermediate candidate; known SVM-stage-invalid unicode rows can still remain until next stage | Generated by `preprocess_indobert.py` logic through a non-versioned audit invocation; no active reader | INTERMEDIATE |
| `ml-service/quality_audit/reviews_preprocessed_indobert_noise_report.csv` | audit | `1,207` dropped rows and explicit reasons | Not training data; contains confirmed emoji, symbol-heavy, digit-heavy, repeated-garbage, and two Morse-like cases | W `preprocess_indobert.py`; R as training provenance by `train_indobert.py` | KEEP |
| `ml-service/quality_audit/reviews_preprocessed_indobert_noise_report.json` | audit | JSON counterpart of IndoBERT noise report | Not training data | W `preprocess_indobert.py`; R as training provenance by `train_indobert.py` | KEEP |
| `ml-service/quality_audit/preprocess_indobert_quality_summary.json` | audit / evaluation | Quality counts, distributions, and samples | Current strongest IndoBERT filtering evidence | R by `train_indobert.py` as preprocessing provenance | KEEP |
| `ml-service/quality_audit/reviews_preprocessed_svm_quality_filtered.csv` | audit / processed | Valid rows after SVM-stage filtering (`96,534`) | Strong intermediate candidate; no active reader | Generated by `preprocess_svm.py` logic through a non-versioned audit invocation | INTERMEDIATE |
| `ml-service/quality_audit/reviews_preprocessed_svm_noise_report.csv` | audit | `41` additional dropped rows after SVM cleaning | Not training data | W `preprocess_svm.py`; no active consumer | KEEP |
| `ml-service/quality_audit/reviews_preprocessed_svm_noise_report.json` | audit | JSON counterpart of SVM noise report | Not training data | W `preprocess_svm.py`; no active consumer | KEEP |
| `ml-service/quality_audit/preprocessing_quality_summary.json` | audit / evaluation | SVM-stage quality counts and final label distribution | Current strongest final valid-row summary | No active backend reader | KEEP |
| `ml-service/quality_audit/reviews_final_quality_filtered.csv` | audit / processed | Compact valid dataset after both quality stages (`96,534`) | Verified MS-15B promotion source. Every row passed the current shared quality detector during full validation | W-capable via `preprocess_svm.py`; no active runtime reader | KEEP AS LINEAGE SOURCE |
| `ml-service/quality_audit/text_length_before_after_cleaning.csv` | audit output | Aggregate text-length comparison for audit run | Supporting metric, not training data | Generated by preprocessing metrics logic | KEEP |
| `ml-service/quality_audit/text_length_before_after_cleaning.json` | audit output | JSON counterpart of text-length comparison | Supporting metric, not training data | Generated by preprocessing metrics logic | KEEP |

### 3.5 EDA 01 - Data Acquisition Outputs

| Path(s) | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `datasets/outputs/eda/01_data_acquisition/rating_distribution_raw.csv`<br>`datasets/outputs/eda/01_data_acquisition/rating_distribution_raw.json` | output | Raw rating distribution | Reproducible summary; no row text | W `label_by_rating.py`; JSON API `review-service` | KEEP |
| `datasets/outputs/eda/01_data_acquisition/sentiment_distribution_raw.csv`<br>`datasets/outputs/eda/01_data_acquisition/sentiment_distribution_raw.json` | output | Initial sentiment distribution | Reproducible summary | W `label_by_rating.py`; JSON APIs `review-service`, `sentiment-service` | KEEP |
| `datasets/outputs/eda/01_data_acquisition/missing_value_summary.csv`<br>`datasets/outputs/eda/01_data_acquisition/missing_value_summary.json` | output / audit | Raw missing-value summary | Reproducible quality summary | W `label_by_rating.py`; JSON API `review-service` | KEEP |
| `datasets/outputs/eda/01_data_acquisition/scraping_quota_achievement.csv`<br>`datasets/outputs/eda/01_data_acquisition/scraping_quota_achievement.json` | output | Target versus achieved counts | Reproducible acquisition summary | W `label_by_rating.py`; JSON API `review-service` | KEEP |
| `datasets/outputs/eda/01_data_acquisition/temporal_distribution_monthly_raw.csv`<br>`datasets/outputs/eda/01_data_acquisition/temporal_distribution_monthly_raw.json` | output | Monthly raw-review distribution | Reporting-only aggregate | W `label_by_rating.py`; notebook 01 | KEEP |
| `datasets/outputs/eda/01_data_acquisition/temporal_distribution_monthly_by_rating.csv`<br>`datasets/outputs/eda/01_data_acquisition/temporal_distribution_monthly_by_rating.json` | output | Monthly distribution by rating | Reporting-only aggregate | W `label_by_rating.py`; notebook 01 | KEEP |
| `datasets/outputs/eda/01_data_acquisition/text_length_histogram_raw.csv` | output | Raw text-length histogram bins | Reporting-only aggregate | W `label_by_rating.py`; notebook 01 | KEEP |
| `datasets/outputs/eda/01_data_acquisition/text_length_summary_raw.json` | output | Raw text-length summary | Reporting-only aggregate | W `label_by_rating.py`; API `review-service` | KEEP |

### 3.6 EDA 02 - Relabeling, Preprocessing, and Weak Aspect Labels

| Path(s) | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `datasets/outputs/eda/02_preprocessing/label_distribution_before_relabeling.csv`<br>`datasets/outputs/eda/02_preprocessing/label_distribution_before_relabeling.json`<br>`datasets/outputs/eda/02_preprocessing/label_distribution_after_relabeling.csv`<br>`datasets/outputs/eda/02_preprocessing/label_distribution_after_relabeling.json`<br>`datasets/outputs/eda/02_preprocessing/relabeling_summary.json` | output | Sentiment relabeling evidence for all `97,782` raw rows | Valid relabeling-stage evidence; intentionally pre-quality-filter | W `relabel_by_keywords.py`; JSON APIs `review-service`, `sentiment-service` | KEEP |
| `datasets/outputs/eda/02_preprocessing/preprocessing_summary.json` | output | Old preprocessing summary reporting `97,782` rows and 91 empty SVM texts | Stale relative to the quality-filtered branch; actively exposed by API | W `preprocess_svm.py`; API `review-service` | NEEDS DECISION |
| `datasets/outputs/eda/02_preprocessing/text_length_before_after_cleaning.csv`<br>`datasets/outputs/eda/02_preprocessing/text_length_before_after_cleaning.json` | output | Old before/after text-length metrics | Pre-quality-filter snapshot; API reads JSON | W `preprocess_svm.py`; API `review-service` | NEEDS DECISION |
| `datasets/outputs/eda/02_preprocessing/aspect_label_distribution.csv`<br>`datasets/outputs/eda/02_preprocessing/aspect_label_distribution.json`<br>`datasets/outputs/eda/02_preprocessing/aspect_by_sentiment_distribution.csv`<br>`datasets/outputs/eda/02_preprocessing/aspect_by_sentiment_distribution.json`<br>`datasets/outputs/eda/02_preprocessing/aspect_labeling_summary.json` | legacy output | Earlier weak aspect-label snapshot | Superseded by refined outputs but still read by notebook/API fallback | Notebook 02; API fallback `review-service` | LEGACY; NOT SAFE TO DELETE |
| `datasets/outputs/eda/02_preprocessing/aspect_label_distribution_refined.csv`<br>`datasets/outputs/eda/02_preprocessing/aspect_label_distribution_refined.json`<br>`datasets/outputs/eda/02_preprocessing/aspect_by_sentiment_distribution_refined.csv`<br>`datasets/outputs/eda/02_preprocessing/aspect_by_sentiment_distribution_refined.json`<br>`datasets/outputs/eda/02_preprocessing/aspect_label_confidence_distribution.csv`<br>`datasets/outputs/eda/02_preprocessing/aspect_label_confidence_distribution.json`<br>`datasets/outputs/eda/02_preprocessing/aspect_labeling_refined_summary.json` | output | Refined weak aspect-label distributions and confidence | Derived from unfiltered `reviews_final.csv`; active summary evidence | W `label_aspects_by_keywords.py`; API `review-service` reads refined summary | NEEDS DECISION |
| `datasets/outputs/eda/02_preprocessing/aspect_taxonomy_candidate_terms.csv`<br>`datasets/outputs/eda/02_preprocessing/aspect_taxonomy_derivation_summary.json` | output / evaluation | Candidate-term evidence for aspect taxonomy | Derived from unfiltered processed rows | W `derive_aspect_taxonomy.py`; summary API `review-service` | NEEDS DECISION |
| `datasets/outputs/eda/02_preprocessing/general_fallback_terms.csv`<br>`datasets/outputs/eda/02_preprocessing/general_fallback_analysis.json` | output / audit | Analysis of `General` weak-label fallback | Useful evidence, but upstream lineage is unfiltered | W `derive_aspect_taxonomy.py`; JSON API `review-service` | KEEP; REGENERATE LATER |

### 3.7 EDA 03 - IndoBERT Preparation and Experiment Outputs

| Path(s) | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `datasets/outputs/eda/03_indobert/indobert_dataset_summary.json`<br>`datasets/outputs/eda/03_indobert/indobert_label_distribution.csv`<br>`datasets/outputs/eda/03_indobert/indobert_label_distribution.json`<br>`datasets/outputs/eda/03_indobert/indobert_split_distribution.csv`<br>`datasets/outputs/eda/03_indobert/indobert_split_distribution.json`<br>`datasets/outputs/eda/03_indobert/indobert_text_length_summary.json` | output / split metadata | Current split-generation summary | Confirms unfiltered `97,782`-row source and zero status filtering | W `prepare_indobert_dataset.py`; service availability/reporting | NEEDS DECISION |
| `datasets/outputs/eda/03_indobert/run_1_baseline/indobert_dataset_summary.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_label_distribution.csv`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_label_distribution.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_split_distribution.csv`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_split_distribution.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_text_length_summary.json` | legacy evaluation metadata | Run 1 dataset snapshot | Historical duplicate; pre-quality-filter lineage | Notebook/report fallback | ARCHIVE LATER |
| `datasets/outputs/eda/03_indobert/run_1_baseline/indobert_training_metrics.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_classification_report.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_confusion_matrix.csv`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_test_predictions.csv` | evaluation output | Baseline experiment metrics and predictions | Thesis evidence; metrics inherit historical data quality | API sentiment/report fallback; evaluation docs | KEEP |
| `datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_class_weights.json`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_classification_report.json`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_confusion_matrix.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_error_analysis.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_run_comparison.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_run_comparison.json`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_test_predictions.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_training_history.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_training_history.json`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_training_metrics.json` | evaluation output | Historical weighted-loss experiment | Thesis evidence; not selected; pre-quality-filter metrics | API sentiment/report, notebooks, consolidated evaluation | KEEP; ARCHIVE LATER only after thesis evidence policy |
| `datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_class_weights.json`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_classification_report.json`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_confusion_matrix.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_error_analysis.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_run_comparison.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_run_comparison.json`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_test_predictions.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_training_history.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_training_history.json`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_training_metrics.json` | evaluation output | Selected historical IndoBERT run | Active reported metrics, but docs already state retraining is needed after filtered split regeneration | API sentiment/report, model evaluation, notebook 03 | KEEP; REGENERATE LATER |
| `datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_class_weights.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_classification_report.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_confusion_matrix.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_error_analysis.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_run_comparison.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_run_comparison.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_slang_normalization_samples.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_slang_normalization_summary.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_test_predictions.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_training_history.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_training_history.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_training_metrics.json` | evaluation output | Slang-normalization experiment | Historical non-selected evidence; pre-quality-filter lineage | API/report comparison, notebook 03 | KEEP; ARCHIVE LATER only after thesis evidence policy |

### 3.8 EDA 04 - SVM Aspect Preparation and Experiments

| Path(s) | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `datasets/outputs/eda/04_svm/svm_aspect_dataset_summary.json`<br>`datasets/outputs/eda/04_svm/svm_aspect_label_distribution.csv`<br>`datasets/outputs/eda/04_svm/svm_aspect_label_distribution.json`<br>`datasets/outputs/eda/04_svm/svm_aspect_by_sentiment_distribution.csv`<br>`datasets/outputs/eda/04_svm/svm_aspect_by_sentiment_distribution.json`<br>`datasets/outputs/eda/04_svm/svm_aspect_confidence_distribution.csv`<br>`datasets/outputs/eda/04_svm/svm_aspect_confidence_distribution.json` | output / dataset metadata | Current weak-label SVM dataset summary/distributions | Based on `97,782` unfiltered upstream rows before narrowing to `16,983` | W `prepare_svm_aspect_dataset.py`; API `aspect-service` | NEEDS DECISION |
| `datasets/outputs/eda/04_svm/final_aspect_taxonomy_for_ahp.csv`<br>`datasets/outputs/eda/04_svm/final_aspect_taxonomy_for_ahp.json` | output / evaluation | Five-class merged taxonomy for AHP/Fuzzy AHP | Active criteria evidence; indirectly derived from old weak labels | API `aspect-service`, `report-service` | KEEP; REVALIDATE LATER |
| `datasets/outputs/eda/04_svm/svm_artifact_manifest.json` | output metadata | SVM artifact manifest | Metadata only; no dataset rows | Service/docs | KEEP |
| `datasets/outputs/eda/04_svm/svm_final_model_selection.csv`<br>`datasets/outputs/eda/04_svm/svm_final_model_selection.json`<br>`datasets/outputs/eda/04_svm/svm_scenario_comparison.csv`<br>`datasets/outputs/eda/04_svm/svm_scenario_comparison.json`<br>`datasets/outputs/eda/04_svm/svm_training_summary.json` | evaluation output | Original-vs-merged scenario comparison and selected model | Active reporting evidence; metrics should be superseded only after clean-data rerun | API `aspect-service`, `report-service`, evaluation frontend | KEEP |
| `datasets/outputs/eda/04_svm/svm_merged_5class_classification_report.json`<br>`datasets/outputs/eda/04_svm/svm_merged_5class_confusion_matrix.csv`<br>`datasets/outputs/eda/04_svm/svm_merged_5class_metrics.json`<br>`datasets/outputs/eda/04_svm/svm_merged_5class_predictions.csv`<br>`datasets/outputs/eda/04_svm/svm_merged_5class_split_distribution.csv`<br>`datasets/outputs/eda/04_svm/svm_merged_5class_split_distribution.json` | evaluation output | Selected merged five-class SVM experiment | Active metrics with old upstream lineage | API `aspect-service`, consolidated evaluation | KEEP; REGENERATE LATER |
| `datasets/outputs/eda/04_svm/svm_original_7class_classification_report.json`<br>`datasets/outputs/eda/04_svm/svm_original_7class_confusion_matrix.csv`<br>`datasets/outputs/eda/04_svm/svm_original_7class_metrics.json`<br>`datasets/outputs/eda/04_svm/svm_original_7class_predictions.csv`<br>`datasets/outputs/eda/04_svm/svm_original_7class_split_distribution.csv`<br>`datasets/outputs/eda/04_svm/svm_original_7class_split_distribution.json` | evaluation output | Historical seven-class baseline | Non-selected thesis evidence | API comparison fallback, notebooks | KEEP; ARCHIVE LATER only after thesis evidence policy |

### 3.9 EDA 05-08 - Consolidated Evaluation and Decision Outputs

| Path(s) | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `datasets/outputs/eda/05_evaluation/model_evaluation_summary.csv`<br>`datasets/outputs/eda/05_evaluation/model_evaluation_summary.json` | evaluation output | Consolidated IndoBERT/SVM metrics and selected candidates | Active API/frontend source; inherits historical model-data lineage and lacks ROC-AUC | API `review-service`, `sentiment-service`, `aspect-service`, `report-service`; frontend Evaluation/Dashboard | KEEP; REGENERATE AFTER MODEL RERUN |
| `datasets/outputs/eda/06_ahp/validation/ahp_expert_judgement_validation_report.csv`<br>`datasets/outputs/eda/06_ahp/validation/ahp_expert_judgement_validation_report.json` | audit / validation | AHP judgement validation | Sample/template-derived; not final expert data | W validator; methodology docs | KEEP |
| `datasets/outputs/eda/06_ahp/aggregated/ahp_aggregated_pairwise_judgement.csv`<br>`datasets/outputs/eda/06_ahp/aggregated/ahp_aggregated_pairwise_judgement.json` | output | Aggregated AHP judgements | Sample/development unless real expert inputs verified | W aggregator; methodology docs | KEEP |
| `datasets/outputs/eda/06_ahp/sample_development/ahp_calculation_summary_sample_development.json`<br>`datasets/outputs/eda/06_ahp/sample_development/ahp_consistency_sample_development.json`<br>`datasets/outputs/eda/06_ahp/sample_development/ahp_pairwise_matrix_sample_development.csv`<br>`datasets/outputs/eda/06_ahp/sample_development/ahp_weights_sample_development.csv`<br>`datasets/outputs/eda/06_ahp/sample_development/ahp_weights_sample_development.json` | output | Sample AHP calculation | Explicitly not final expert judgement | W AHP calculation script; API `report-service` status | KEEP |
| `datasets/outputs/eda/07_fuzzy_ahp/validation/fuzzy_ahp_expert_judgement_validation_report.csv`<br>`datasets/outputs/eda/07_fuzzy_ahp/validation/fuzzy_ahp_expert_judgement_validation_report.json` | audit / validation | Fuzzy AHP judgement validation | Sample/template-derived; not final expert data | W validator; methodology docs | KEEP |
| `datasets/outputs/eda/07_fuzzy_ahp/aggregated/fuzzy_ahp_aggregated_pairwise_judgement.csv`<br>`datasets/outputs/eda/07_fuzzy_ahp/aggregated/fuzzy_ahp_aggregated_pairwise_judgement.json` | output | Aggregated Fuzzy AHP judgements | Sample/development unless real expert inputs verified | W aggregator; methodology docs | KEEP |
| `datasets/outputs/eda/07_fuzzy_ahp/sample_development/fuzzy_ahp_calculation_summary_sample_development.json`<br>`datasets/outputs/eda/07_fuzzy_ahp/sample_development/fuzzy_ahp_modal_consistency_sample_development.json`<br>`datasets/outputs/eda/07_fuzzy_ahp/sample_development/fuzzy_ahp_pairwise_matrix_sample_development.json`<br>`datasets/outputs/eda/07_fuzzy_ahp/sample_development/fuzzy_ahp_weights_sample_development.csv`<br>`datasets/outputs/eda/07_fuzzy_ahp/sample_development/fuzzy_ahp_weights_sample_development.json` | output | Sample Fuzzy AHP calculation | Explicitly not final expert judgement | W Fuzzy AHP calculation script; API `report-service` status | KEEP |
| `datasets/outputs/eda/08_ranking_comparison/sample_development/ahp_fuzzy_ranking_comparison_sample_development.csv`<br>`datasets/outputs/eda/08_ranking_comparison/sample_development/ahp_fuzzy_ranking_comparison_sample_development.json`<br>`datasets/outputs/eda/08_ranking_comparison/sample_development/ranking_comparison_summary_sample_development.json` | output | Sample AHP/Fuzzy AHP comparison | Active read-only ranking source, explicitly sample | W comparison script; API `report-service`; Dashboard/AHP frontend | KEEP |

## 4. Code Reference Audit

### 4.1 Script Readers and Writers

| Artifact or family | Writer(s) | Reader(s) | Finding |
| --- | --- | --- | --- |
| `datasets/raw/reviews_rating_*_raw.csv`, `scraping_state_rating_*.json`, `app_info_spotify.json`, `scraping_summary.json` | `scrape_reviews.py` | `scrape_reviews.py`; `label_by_rating.py`; review API summaries | Raw acquisition boundary is clear. |
| `datasets/raw/reviews_raw_labeled.csv`, `data_acquisition_summary.json`, EDA 01 | `label_by_rating.py` | `relabel_by_keywords.py`; `review-service`; notebooks | Labeled raw dataset is the stable relabeling input. |
| `reviews_relabelled.csv`, relabeling summaries | `relabel_by_keywords.py` | `preprocess_indobert.py`; notebook 02 | Relabeling is before quality filtering, so noise here is expected. |
| `reviews_preprocessed_indobert.csv` and default sibling noise reports | `preprocess_indobert.py` | `preprocess_svm.py`; notebook 02 | Current script can filter, but the committed processed CSV is an older unfiltered output without provenance columns. |
| `reviews_preprocessed_svm.csv`, `reviews_final.csv`, preprocessing summaries | `preprocess_svm.py` | `prepare_indobert_dataset.py`; notebook 02; review API | The filename `reviews_final.csv` creates false canonicality. |
| `reviews_with_aspect_labels_refined.csv` | `label_aspects_by_keywords.py` | `prepare_svm_aspect_dataset.py`; review API latest-negative endpoint | Active SVM/review dependency blocks deletion. |
| `datasets/processed/indobert/*` and top-level EDA 03 summaries | `prepare_indobert_dataset.py` | `train_indobert.py`; `prepare_colab_indobert_bundle.py`; Colab notebooks | Current splits were built from unfiltered `reviews_final.csv`. |
| IndoBERT run folders | `train_indobert.py` and Colab export workflow | sentiment/report services; model evaluation; notebooks | Metrics are active reporting inputs but should be versioned as historical after a clean-data rerun. |
| `datasets/processed/svm/svm_aspect_dataset.csv`, EDA 04 dataset summaries | `prepare_svm_aspect_dataset.py` | `train_svm_aspect_classifier.py` | Current SVM dataset descends from unfiltered refined weak labels. |
| EDA 04 experiment outputs | `train_svm_aspect_classifier.py` | aspect/report services; consolidated evaluation | Selected merged model remains active but data lineage is pre-promotion. |
| EDA 05 | Notebook/evaluation consolidation workflow; `evaluate_models.py` is only a TODO stub | all summary services and frontend evaluation | Current consolidated files are active and cannot be removed. Writer ownership needs stabilization. |
| EDA 06-08 | validation, aggregation, calculation, and comparison scripts | report-service; AHP frontend | Separate sample-development lineage is clear. |
| `ml-service/quality_audit/*_quality_filtered.csv` | Preprocessing script logic via an audit invocation | No committed consumer | The cleaner branch is orphaned from active pipeline paths. |
| quality noise reports and summaries | preprocessing script logic | `train_indobert.py` reads IndoBERT summary/noise report only as provenance | Training metadata references the audit, but split contents do not use the filtered CSV. |

### 4.2 Notebook References

| Notebook | Artifact behavior | Status |
| --- | --- | --- |
| `01_data_acquisition.ipynb` | Reads per-rating raw CSVs and EDA 01 summaries. | Current for raw acquisition evidence. |
| `02_preprocessing.ipynb` | Hardcodes the old chain `reviews_raw_labeled -> reviews_relabelled -> reviews_preprocessed_indobert -> reviews_preprocessed_svm/reviews_final -> reviews_with_aspect_labels_refined`. | Ambiguous/outdated because it does not promote the quality-audit branch. |
| `03a`/`03b`/`03c`/`03d` IndoBERT Colab notebooks | Read `datasets/processed/indobert/{train,validation,test}.csv` and `label_mapping.json`. | Active derived dataset dependency. `03c` records a noise-report path but still records `reviews_final.csv` as input lineage. |
| `03_indobert_sentiment_modeling.ipynb` | Reads EDA 03 run outputs for comparison. | Reporting/evaluation only. |
| `04_svm_aspect_classification.ipynb` | Reads EDA 04 outputs and model-selection evidence. | Reporting/evaluation only. |
| `05_model_evaluation.ipynb` | Reads/writes consolidated EDA 05 outputs. | Active reporting dependency. |
| `06`/`07`/`08` decision notebooks | Use explicit `sample_development` output folders. | Clear sample-only lineage. |

### 4.3 Backend Service Readers

| Service/API | Direct artifact reads | Dependency consequence |
| --- | --- | --- |
| `api-gateway-service` | No dataset CSV/JSON reads found. It proxies services and persists runtime inference history separately. | Correct boundary; no artifact path change needed until downstream contracts change. |
| `review-service GET /dataset/summary` | Raw summaries, EDA 01 JSON, EDA 05 availability, and file-existence checks | Reports raw `97,782` count, not canonical valid-row count. Exposes developer-oriented availability flags. |
| `review-service GET /scraping/summary` | Raw scraping/data-acquisition summaries and quota JSON | Summary-only; no actual scraping sample rows. |
| `review-service GET /preprocessing/summary` | EDA 02 relabeling/preprocessing/aspect/taxonomy/general-fallback JSON | Reads stale pre-quality `preprocessing_summary.json`; does not read quality-audit summaries. |
| `review-service GET /reviews/random` | Preferred `datasets/processed/reviews_final.csv`, fallback raw labeled CSV | Currently serves noisy rows and a narrow schema. |
| `review-service GET /reviews/latest-negative` | Refined aspect labels, then old aspect labels, then `reviews_final`, then raw | Active dependency on unfiltered weak-label files. |
| `sentiment-service GET /sentiment/summary` | EDA 02 post-relabel distribution and EDA 01 raw distribution | Final distribution is pre-quality-filter and sums to `97,782`. |
| `sentiment-service GET /sentiment/evaluation` | EDA 05 and EDA 03 run metrics/reports | Active historical evaluation evidence. |
| `aspect-service GET /aspects/summary` | EDA 04 SVM dataset summary, taxonomy, final selection, aspect/sentiment CSV | Active weak-label/model summary; pre-promotion lineage. |
| `aspect-service GET /aspects/evaluation` | EDA 04 scenario metrics/reports and EDA 05 | Active evaluation evidence. |
| `report-service` | EDA 03-08 summaries, selected model/taxonomy, ranking CSV | Feeds Dashboard/Evaluation/AHP; exposes source availability and ranking source path. |
| `decision-service` | No review dataset artifact read found in service calculations. | AHP/Fuzzy AHP calculation code is separate from review artifact lineage. |

### 4.4 Frontend Indirect Dependencies

The frontend reads no CSV/JSON directly. It depends on API fields derived from artifacts:

| Frontend service/page | API dependency | Underlying artifact family |
| --- | --- | --- |
| Dataset | `/dataset/summary`, `/reviews/random` | Raw/EDA 01 plus noisy `reviews_final.csv` |
| Scraping | `/scraping/summary`, `/reviews/random` | Raw acquisition summaries plus generic review samples |
| Preprocessing | `/preprocessing/summary`, `/reviews/random` | EDA 02 aggregate JSON plus generic samples from `reviews_final.csv` |
| Sentiment Analysis | `/sentiment/summary`, `/sentiment/evaluation`, `/reviews/random` | EDA 01/02/03/05 plus generic review samples |
| Aspect Classification | `/aspects/summary`, `/aspects/evaluation`, `/reviews/random` | EDA 04/05 plus generic samples |
| Model Evaluation | `/evaluation/summary` | EDA 05 through report-service |
| Dashboard | All summary APIs, latest negative reviews, ranking comparison | Raw, EDA 01-05/08, refined aspect labels |
| AHP/Fuzzy AHP | `/ahp/criteria`, `/evaluation/summary`, `/reports/ranking-comparison` | Decision-service criteria and EDA 04/05/08 |
| Uji Ulasan | `/inference/review`, `/inference/history` | Runtime model inference and API Gateway database; not research CSV lineage |

### 4.5 Documentation Drift

| File | Ambiguity |
| --- | --- |
| `ml-service/notebooks/02_preprocessing.ipynb` | Documents only the old unfiltered processed chain. |
| `docs/microservices/review-service-extraction.md` | Calls `reviews_final.csv` the preferred review source without quality caveat. |
| `docs/microservices/api-contract.md` | Exposes `reviews_final` availability and a ranking `source_file`; does not define canonical processed lineage. |
| `docs/ml/indobert-artifact-export.md` | Correctly says splits must be regenerated after quality filtering, but current split files remain old. |
| `docs/microservices/repository-hygiene-audit.md` | Classifies `quality_audit/` as research evidence, not as a candidate source requiring promotion. |
| `docs/microservices/architecture.md` | Defines artifact policy but not the canonical processed filename or lineage version. |

No audited document currently declares a single canonical processed dataset and its derivation contract.

## 5. Current Pipeline Lineage Map

### 5.1 Actual Active Lineage

```text
datasets/raw/reviews_rating_{1..5}_raw.csv
  -> label_by_rating.py
  -> datasets/raw/reviews_raw_labeled.csv
  -> relabel_by_keywords.py
  -> datasets/processed/reviews_relabelled.csv                 [noise still expected]
  -> preprocess_indobert.py / older committed output
  -> datasets/processed/reviews_preprocessed_indobert.csv      [unfiltered legacy]
  -> preprocess_svm.py / older committed output
  -> datasets/processed/reviews_preprocessed_svm.csv
  -> datasets/processed/reviews_final.csv                      [confirmed noisy]
     -> prepare_indobert_dataset.py
     -> datasets/processed/indobert/{train,validation,test}.csv [confirmed noisy lineage]
     -> train_indobert.py / Colab
     -> datasets/outputs/eda/03_indobert/run_*/

datasets/processed/reviews_final.csv
  -> label_aspects_by_keywords.py
  -> datasets/processed/reviews_with_aspect_labels_refined.csv
  -> prepare_svm_aspect_dataset.py
  -> datasets/processed/svm/svm_aspect_dataset.csv
  -> train_svm_aspect_classifier.py
  -> datasets/outputs/eda/04_svm/

EDA 01-05 + EDA 08
  -> domain service summary APIs
  -> API Gateway
  -> frontend Dashboard/Dataset/Sentiment/Aspect/Evaluation/AHP pages
```

### 5.2 Orphaned Quality-Filtered Branch

```text
datasets/processed/reviews_relabelled.csv
  -> current preprocess_indobert.py quality logic
  -> ml-service/quality_audit/reviews_preprocessed_indobert_quality_filtered.csv
  +  ml-service/quality_audit/reviews_preprocessed_indobert_noise_report.{csv,json}
  -> current preprocess_svm.py quality logic
  -> ml-service/quality_audit/reviews_preprocessed_svm_quality_filtered.csv
  -> ml-service/quality_audit/reviews_final_quality_filtered.csv
  +  ml-service/quality_audit/reviews_preprocessed_svm_noise_report.{csv,json}

No active prepare script, backend service, or frontend API reads the three quality-filtered CSVs by their current paths.
```

### 5.3 Expected Versus Actual Gap

| Expected step | Actual repository state | Gap |
| --- | --- | --- |
| Quality filtering produces canonical processed data | Valid data remains under `ml-service/quality_audit/` | Promotion missing |
| IndoBERT splits derive from canonical valid data | Splits derive from noisy `reviews_final.csv` | Regeneration missing |
| SVM labels/dataset derive from canonical valid data | Refined labels and SVM dataset derive from old branch | Regeneration missing |
| Backend preprocessing summary reports valid/dropped counts | Backend reads old EDA 02 summary only | API contract missing quality fields |
| Frontend sample tables receive stage-specific rows | Frontend reuses narrow generic review samples | API sample contracts missing |

## 6. Noise/Gibberish Finding

### 6.1 Confirmed Evidence

| Evidence | Result |
| --- | --- |
| `preprocess_indobert_quality_summary.json` | `97,782` input; `96,575` valid; `1,207` dropped |
| IndoBERT drop reasons | 905 too short, 203 high symbol ratio, 45 too few alphabet chars, 39 repeated garbage, 13 high digit ratio, 2 Morse-like |
| `preprocessing_quality_summary.json` | `96,575` input; `96,534` valid; 41 additional drops |
| `reviews_final.csv` targeted sample | Emoji-only row `f4a4d23f-...` remains |
| `reviews_final.csv` targeted sample | Morse-like row `1b2b73e6-...` remains |
| Current IndoBERT test split | Morse-like row `1b2b73e6-...` remains |
| Current IndoBERT train split | SVM-stage-dropped stylized-text row `96e6b8f5-...` remains |
| `reviews_final_quality_filtered.csv` | Known dropped IDs absent; sampled rows show `preprocessing_status=valid` and `drop_reason=valid` |

### 6.2 Interpretation

- Noise in raw and relabeled files is not itself a defect; those are pre-filter stages.
- Noise in `reviews_final.csv` is a contract defect because its name and active consumers imply a clean final dataset.
- The quality audit is conservative and auditable, but this audit did not re-run it or prove every retained row is semantically valid.
- `reviews_final_quality_filtered.csv` is therefore a `CANONICAL CANDIDATE`, not a final declaration.

## 7. Canonical Dataset Candidate

### Candidate

`ml-service/quality_audit/reviews_final_quality_filtered.csv`

Why it is closest:

- it is downstream of both IndoBERT and SVM quality checks;
- it contains `original_text`, `cleaned_text`, `preprocessing_status`, `drop_reason`, and before/after lengths;
- its count matches the final quality summary (`96,534`);
- known audit-dropped rows are absent in targeted searches;
- it retains core identifiers, sentiment labels, `text_indobert`, and `text_svm`.

MS-15B promotion status:

- canonical CSV and JSON counterparts now exist under `datasets/processed/`;
- the canonical CSV is byte-identical to this source and retains all `16` source columns;
- the exact source and output hashes are recorded in Section 15;
- no committed active consumer reads the canonical path yet by design;
- aspect labels must be regenerated from it rather than copied from the old branch;
- model-specific splits and evaluation outputs must be regenerated.

MS-15B decision: promoted. The audit source remains in place as lineage evidence. Reader migration and deterministic script output belong to MS-15C and later milestones.

## 8. Backend/API Dependency Findings

| Finding | Impact | Priority |
| --- | --- | --- |
| `review-service` prefers noisy `reviews_final.csv` for random samples. | Noise can appear directly on Dataset, Scraping, Preprocessing, and Sentiment pages. | High |
| Latest-negative reviews prefer `reviews_with_aspect_labels_refined.csv`. | Dashboard/Aspect samples inherit old upstream data and weak labels. | High |
| Preprocessing API ignores quality-audit summaries. | Dashboard processed count remains `97,782` instead of `96,534`; dropped reasons are unavailable. | High |
| Sentiment summary uses post-relabel distribution before quality filtering. | “Final” sentiment counts do not describe the valid canonical candidate. | High |
| IndoBERT split summary confirms zero quality-status removals. | Current training/evaluation lineage conflicts with quality-filtering claims. | High |
| SVM summaries derive from the old refined weak-label dataset. | Selected metrics need regeneration after canonical promotion. | High |
| Public summary schemas expose `dataset_availability` and `output_source_availability`. | Frontend receives developer-oriented `*_exists` and artifact-presence fields. | Medium |
| Ranking response exposes `source_file`; warnings can include repository paths. | Internal filenames/paths leak into public API contracts. | Medium |
| Summary endpoints provide aggregates but no stage-specific sample rows. | Frontend reuses generic review samples for unrelated tables. | High |
| API Gateway does not read datasets directly. | Correct architecture boundary; fixes belong in domain APIs, not gateway file parsing. | KEEP |

## 9. Frontend Mismatch Findings

The common `"-"` output is usually not a rendering defect. It is produced when pages request fields that `ReviewSample` does not provide. The backend schema currently returns only `external_id`, user identifiers, rating, content, word count, initial/final sentiment, aspect label, reviewed date, and source.

| Page | Likely mismatch | Result |
| --- | --- | --- |
| Dashboard | Requests cleaned text and app version from latest-negative samples; ranking CSV lacks negative count, priority score, recommendation, and interpretation fields. | Several columns become `-`; recommendation data is partly frontend-generated. |
| Dataset | Requests thumbs-up count and app version; directly renders raw `dataset_availability` keys such as `datasets_dir_exists`. | `-` cells plus developer-oriented field names in UI. |
| Scraping | Uses `/reviews/random` as a scraping preview but requests `scrape_request_id`, `scraped_at`, and `scraping_status`. | Most scraping-specific columns are unavailable or synthesized. |
| Preprocessing | Requests cleaned text, before/after lengths, noise flag, drop reason, and status from generic review samples. | Quality columns are `-` because API returns no preprocessing sample rows. |
| Sentiment Analysis | Requests cleaned text, predicted sentiment, confidence, and prediction source from historical review samples. | Final weak/relabel sentiment may appear, but runtime-model columns are `-`. |
| Aspect Classification | Requests cleaned text, aspect confidence, and prediction source; API samples usually expose only weak `aspect_label`. | Model-specific columns are `-` or represent weak labels rather than SVM predictions. |
| Evaluation Model | Requests ROC-AUC, but consolidated metrics provide accuracy/precision/recall/F1 only. | ROC-AUC is always `-` for current records. |
| AHP/Fuzzy AHP | Criteria/ranking APIs do not provide complaint examples, negative-review counts, or consistency values used by the page. | Several read-only result fields remain `-`; sample status itself is handled correctly. |
| Uji Ulasan | Uses runtime inference/history, not research CSV samples. | No direct data-artifact mismatch; keep separate until MS-15G product-flow decision. |

## 10. Recommended Canonical Naming Policy

### 10.1 Canonical Files

| Target path | Contract |
| --- | --- |
| `datasets/processed/dataset_spotify_processed.csv` | Canonical final valid processed rows, including provenance and model text columns. |
| `datasets/processed/dataset_spotify_processed.json` | Deterministic JSON representation of the same canonical rows and schema version. |
| `datasets/processed/dataset_spotify_noise_report.csv` | All dropped rows with explicit reasons; never used as training data. |
| `datasets/processed/dataset_spotify_noise_report.json` | JSON counterpart of the dropped-row audit. |
| `datasets/processed/indobert/train.csv` | Derived only from canonical processed CSV. |
| `datasets/processed/indobert/validation.csv` | Derived only from canonical processed CSV. |
| `datasets/processed/indobert/test.csv` | Derived only from canonical processed CSV. |
| `datasets/processed/indobert/label_mapping.json` | Versioned with the exact split generation. |
| `datasets/processed/svm/train.csv` | Derived model-specific train split from canonical data plus regenerated weak aspect labels. |
| `datasets/processed/svm/test.csv` | Derived model-specific test split. Add validation split only if the training contract requires it. |
| `datasets/processed/svm/label_mapping.json` | Versioned aspect-label mapping for the derived split. |

All four proposed `dataset_spotify_*` files now exist after MS-15B. The three proposed SVM split/mapping files do not yet exist and remain MS-15D work.

### 10.2 Naming and Lineage Rules

1. `dataset_spotify_processed.*` is the only canonical valid processed dataset.
2. CSV and JSON must be generated in one run from one dataframe and share a manifest/hash/version.
3. `dataset_spotify_noise_report.*` is audit evidence, not training data.
4. IndoBERT and SVM files are derived datasets and must record canonical source hash, preprocessing version, split seed, and generation time.
5. `reviews_final.csv`, `reviews_preprocessed_*`, and old aspect-labeled files become deprecated aliases only after all readers migrate.
6. Evaluation folders remain versioned experiment evidence and must state the canonical source hash used.
7. Backend services should use stable semantic API fields, not filenames or `*_exists` keys.

## 11. Cleanup Roadmap MS-15B to MS-15J

| Milestone | Objective | Likely files affected | Main risks | Verification commands |
| --- | --- | --- | --- | --- |
| MS-15B | Verify and promote the canonical processed dataset plus noise reports. | `datasets/processed/dataset_spotify_*`; quality-audit summaries; optional manifest; docs | Accidental row loss, CSV/JSON divergence, provenance loss | Focused preprocessing tests; schema/count/hash comparison; targeted known-noise/known-valid ID checks; `git diff --stat` |
| MS-15C | Make preprocessing scripts write canonical paths deterministically and remove ambiguous `final` defaults. | `preprocess_indobert.py`, `preprocess_svm.py`, shared quality utility, notebook 02, tests | Breaking CLI compatibility; silently changing thresholds | `python -m pytest ml-service/tests` with workspace basetemp; script `--help`; dry/small fixture run |
| MS-15D | Regenerate IndoBERT and SVM derived datasets from the canonical dataset; do not retrain unless separately approved. | `prepare_indobert_dataset.py`, `prepare_svm_aspect_dataset.py`, aspect-label outputs, `datasets/processed/indobert/`, `datasets/processed/svm/`, EDA 03/04 dataset summaries | Split drift, label distribution drift, weak-label changes | Split overlap checks; count/distribution checks; known-noise absence; deterministic seed rerun; dataset prep tests |
| MS-15E | Stabilize backend research-artifact API contracts and add stage-specific sample rows. | review/sentiment/aspect/report schemas/services/routers, API contract docs, gateway tests | Frontend contract breakage; leaking internal paths | Service pytest suites; schema snapshots; `rg` for `source_file`, `file_exists`, `dir_exists`; API sample checks |
| MS-15F | Align frontend tables with stabilized API fields. | frontend services/types/pages for Dashboard, Dataset, Scraping, Preprocessing, Sentiment, Aspect, Evaluation, AHP | Replacing valid empty states with fabricated values | `npm run lint`; `npm run build`; page-level gateway fixtures; browser checks |
| MS-15G | Merge Uji Ulasan into Analisis Sentimen and Scraping into Dataset if the product-flow decision remains valid. | navigation/routes/pages/components/services and frontend docs | Route regressions; mixing research snapshots with runtime inference | `npm run lint`; `npm run build`; route/navigation checks; manual workflow smoke test |
| MS-15H | Apply report-style UI cleanup after data contracts stabilize. | Dashboard/analysis page presentation components and docs | Styling hides provenance/sample warnings; scope creep | lint/build; responsive screenshots; accessibility and sample/fallback visibility checks |
| MS-15I | Archive/remove obsolete CSV/JSON only after zero active references and reproducibility review. | old `reviews_*`, superseded EDA snapshots, archive manifest, docs | Deleting thesis evidence or active fallback inputs | full `rg` reference audit; hash/archive manifest; `git status`; targeted backend/data-prep tests |
| MS-15J | Re-run full demo verification using canonical data and regenerated outputs. | test evidence/docs; no ad hoc source changes | Expensive model/runtime verification; stale local models | backend tests; frontend lint/build; `docker compose config`; controlled Compose demo; endpoint and UI smoke checks |

## 12. Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Promoting the wrong quality file as canonical | Medium | High | Verify schema, counts, hashes, known-noise absence, and generation parameters first. |
| Current model metrics are presented as clean-data metrics | High | High | Label historical metrics and regenerate after canonical split preparation/retraining approval. |
| Deleting `reviews_final.csv` breaks review APIs and IndoBERT prep | High | High | Migrate readers first; retain compatibility only temporarily. |
| Regenerated weak aspect labels change SVM class distribution | High | Medium | Version old/new distributions and rerun selection methodology. |
| JSON canonical file becomes an unnecessary 70+ MB duplicate | Medium | Medium | Define its consumer and serialization contract; if required by thesis, generate deterministically and compress/archive appropriately. |
| API cleanup leaks or removes fields unexpectedly | Medium | High | Version contracts and add service/gateway schema tests. |
| Frontend continues showing `-` after dataset promotion | High | Medium | Fix stage-specific API sample contracts before frontend mapping. |
| Historical AHP/Fuzzy AHP sample outputs are mistaken for final | Medium | High | Preserve `sample_development` and `not_final_expert_judgement` markers. |
| Archive milestone removes reproducibility evidence | Medium | High | Require reference-free proof, hash manifest, and thesis evidence review. |

## 13. Files Not Safe to Delete Yet

| File/family | Reason |
| --- | --- |
| All `datasets/raw/` artifacts | Immutable acquisition evidence and active summary/fallback inputs. |
| `datasets/processed/reviews_final.csv` | Active reader for IndoBERT prep and random review API despite being noisy. |
| `reviews_with_aspect_labels.csv` and `reviews_with_aspect_labels_refined.csv` | Active latest-negative fallback/preferred source; refined file feeds SVM preparation. |
| `datasets/processed/indobert/*` | Active training/Colab inputs until regenerated. |
| `datasets/processed/svm/svm_aspect_dataset.csv` | Active SVM training input. |
| `ml-service/quality_audit/*` | Only current evidence of filtering behavior and canonical candidate data. |
| EDA 01-05 summaries | Active backend/API/frontend dependencies. |
| EDA 03/04 historical run outputs | Thesis experiment evidence and service fallback comparisons. |
| EDA 06-08 sample/validation/aggregation outputs | Active AHP/Fuzzy AHP sample status and ranking display. |

`reviews_preprocessed_indobert.json` and old intermediate CSVs may be archive candidates, but they are not safe to remove until MS-15I proves no notebook, manual workflow, or reproducibility requirement remains.

## 14. Immediate Next Step Recommendation

Proceed with MS-15C only: update preprocessing script defaults and outputs to generate canonical paths deterministically. Do not migrate readers, regenerate model splits, or retrain models in MS-15C.

Current classification: `datasets/processed/dataset_spotify_processed.{csv,json}` is `CANONICAL`; `ml-service/quality_audit/reviews_final_quality_filtered.csv` is `KEEP AS LINEAGE SOURCE`; `datasets/processed/reviews_final.csv` is `LEGACY / NOT SAFE TO DELETE`; current IndoBERT/SVM derived datasets are `NEEDS DECISION / REGENERATE`.

## 15. MS-15B Canonical Promotion Result

### 15.1 Canonical Processed Dataset

| Item | Result |
| --- | --- |
| Source | `ml-service/quality_audit/reviews_final_quality_filtered.csv` |
| Canonical CSV | `datasets/processed/dataset_spotify_processed.csv` |
| Canonical JSON | `datasets/processed/dataset_spotify_processed.json` |
| Rows | `96,534` in source, CSV, and JSON |
| Schema | All `16` source columns retained; JSON uses numeric values for `rating`, `text_length_before`, and `text_length_after` |
| Source/canonical CSV SHA-256 | `1ca97e0290607820f9371194b3495eaa1761d87055d85597ab68ae997ce63239` |
| Canonical JSON SHA-256 | `18acb56d26a5e4022f16a1e819924e07ad055fcee0fc062fb76201bde8cab844` |

Full validation found `96,534` unique IDs, zero empty `cleaned_text` values, zero non-`valid` statuses, zero non-`valid` drop reasons, and zero rows rejected by a fresh run of the current shared quality detector. This detector includes Morse-like, symbol-heavy, digit-heavy, repeated-garbage, short-text, and alphabet-count checks.

### 15.2 Canonical Noise Report

The matching report source is unambiguous. The `1,207` IndoBERT-stage drops, `41` SVM-stage drops, and `96,534` valid rows are pairwise disjoint and their `97,782` unique IDs exactly partition `datasets/processed/reviews_relabelled.csv`.

| Item | Result |
| --- | --- |
| Source reports | `reviews_preprocessed_indobert_noise_report.{csv,json}` and `reviews_preprocessed_svm_noise_report.{csv,json}` under `ml-service/quality_audit/` |
| Canonical CSV | `datasets/processed/dataset_spotify_noise_report.csv` |
| Canonical JSON | `datasets/processed/dataset_spotify_noise_report.json` |
| Rows | `1,248` total: `1,207` IndoBERT-stage and `41` SVM-stage |
| Provenance | Added `quality_stage` with `indobert_preprocessing` or `svm_preprocessing`; all source report columns retained |
| Canonical CSV SHA-256 | `a0d0fa8236f4b66e1a1b93894fe4599fc455f9657234dbbf6a4d139c23718876` |
| Canonical JSON SHA-256 | `37f39a56dd67a962ffc6b9ad9e799ce5180722305cb3edc91e01d11f91f38c30` |

### 15.3 Scope Boundary

Legacy processed files, model-specific splits, scripts, notebooks, services, frontend, Docker, models, and datasets outside the four canonical targets were left unchanged. Old files remain necessary until reader migration and split regeneration are complete.
