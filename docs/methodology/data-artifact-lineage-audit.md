# MS-15A Data Artifact Lineage Audit

Audit date: 2026-06-20

MS-15B promotion update: 2026-06-21

MS-15C preprocessing defaults update: 2026-06-21

MS-15D model-dataset regeneration update: 2026-06-21

MS-15E backend API contract stabilization update: 2026-06-21

MS-15F frontend data mapping fix: 2026-06-24

MS-15G merge Uji Ulasan and Scraping menus: 2026-06-24

MS-15H report-style UI cleanup: 2026-06-24

MS-15I legacy artifact archive: 2026-06-24

Original MS-15A scope: read-only inventory and lineage analysis. Later sections record the scoped MS-15B through MS-15I follow-up changes.

## 1. Executive Summary

SentiRank currently has two competing processed-data branches:

1. The active repository branch under `datasets/processed/` contains the files used by dataset preparation and backend review APIs.
2. A later quality-filtered branch under `ml-service/quality_audit/` contains explicit row-level quality metadata, dropped-row reports, and a cleaner final dataset, but it is not consumed by active preparation scripts or backend services through its current path.

MS-15B promoted `ml-service/quality_audit/reviews_final_quality_filtered.csv` into `datasets/processed/dataset_spotify_processed.csv` and `.json`. Both canonical files contain `96,534` valid rows after `1,207` IndoBERT-stage drops and `41` additional SVM-stage drops. The canonical CSV is byte-identical to its promotion source. Active readers are intentionally unchanged until later milestones.

MS-15C made the preprocessing scripts reproduce those canonical files from project-root-safe defaults. `preprocess_indobert.py` writes a clearly named valid-row stage file and the first-stage noise report; `preprocess_svm.py` owns final canonical CSV/JSON output and merges both noise stages with explicit provenance. Metrics, figures, and summaries are now opt-in secondary diagnostics.

The current `datasets/processed/reviews_final.csv` is not a clean source of truth despite its name. Targeted samples confirm it still contains an emoji-only row and a Morse-like row. Before MS-15D, the Morse-like row also appeared in `datasets/processed/indobert/test.csv`, proving that the old IndoBERT splits were generated from the unfiltered `97,782`-row branch.

MS-15D changed the IndoBERT preparation default to `dataset_spotify_processed.csv` and regenerated its train, validation, test, label mapping, EDA 03 dataset summaries, and EDA 03 figures from all `96,534` canonical rows. Full validation found no split overlap, empty text, invalid labels, non-valid preprocessing metadata, or rows rejected by the shared Morse/symbol/digit/repeated-garbage quality detector.

SVM regeneration was not safe within the current preparation contract. The canonical dataset has `text_svm` but lacks `aspect_label` and `aspect_label_confidence`; the active refined label source still contains all `97,782` old-branch rows, including `1,248` IDs excluded from canonical data. The current `16,983`-row SVM dataset contains `6` noncanonical IDs. Status: `NEEDS VERIFICATION` until weak aspect labels are regenerated or otherwise verified against canonical input without changing the labeling scheme.

MS-15E migrated review samples and dataset/preprocessing summaries to the canonical processed dataset and canonical noise report. Sentiment distribution summaries now use the regenerated EDA 03 distribution. Public research contracts no longer expose repository paths, artifact filenames, or artifact-presence maps; missing data returns semantic empty states and generic warnings. Historical IndoBERT evaluation is labeled `historical_pre_canonical_retraining_required`, while SVM summaries and evaluation remain `needs_verification`.

No legacy files were deleted. No model was trained.

### Decision Summary

| Question | Finding | Confidence |
| --- | --- | --- |
| Canonical clean processed dataset | `datasets/processed/dataset_spotify_processed.{csv,json}` sourced from `ml-service/quality_audit/reviews_final_quality_filtered.csv` | Confirmed by MS-15B validation |
| Misleading noisy `final` file | `datasets/processed/reviews_final.csv` | Confirmed by targeted samples |
| Current IndoBERT preparation input | `datasets/processed/dataset_spotify_processed.csv` -> `datasets/processed/indobert/{train,validation,test}.csv` | Confirmed by MS-15D default, regeneration, and full split validation |
| Current SVM preparation input | `datasets/processed/reviews_with_aspect_labels_refined.csv` -> `datasets/processed/svm/svm_aspect_dataset.csv` | `NEEDS VERIFICATION`; active input still belongs to the old aspect-labeled branch |
| Backend review sample source | Canonical processed rows; optional aspect enrichment remains historical weak-label data marked `needs_verification` | Confirmed by MS-15E service code and tests |
| Quality-filtered branch consumer | No committed consumer of the three `*_quality_filtered.csv` files | Confirmed by repository search |
| Frontend data source | API Gateway only; indirect dependency on backend artifacts | Confirmed by frontend service modules |

## 2. Current Data Artifact Problem

The word `final` currently means several different things:

- `reviews_final.csv` means a compact preprocessing output, not a verified noise-free canonical dataset.
- `reviews_with_aspect_labels_refined.csv` means refined weak aspect labels, but it inherits rows from `reviews_final.csv`.
- IndoBERT `run_3_weighted_loss_lr_1e-5` is the selected historical experiment, but its recorded training lineage still points to the pre-MS-15D unfiltered splits.
- SVM `merged_5class` is the selected taxonomy/model, but its preparation source also descends from the unfiltered branch.
- AHP/Fuzzy AHP files with `sample_development` are pipeline-validation outputs, not final expert-judgement results.

At MS-15A, the quality-filtering implementation was newer than the active processed-data contract and only produced audit outputs under `ml-service/quality_audit/`. MS-15B promoted the data; MS-15C aligned preprocessing defaults. Remaining drift is downstream:

- SVM aspect-label and preparation lineage still depends on `reviews_with_aspect_labels_refined.csv` from the old branch;
- backend review and sentiment contracts are canonical after MS-15E, but historical trained-model metrics still describe pre-MS-15D data;
- SVM summary/evaluation artifacts still describe the unverified old aspect-label lineage;
- frontend mapping still expects removed diagnostics or fields outside the stabilized API and is deferred to MS-15F.

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
| `datasets/processed/reviews_final.csv` | processed output | Compact combined sentiment preprocessing output | Misleading name; confirmed emoji-only and Morse-like rows. No quality metadata columns | Historical W `preprocess_svm.py`; still R by `train_indobert.py` metadata, notebook 02, `review-service`; no longer the IndoBERT preparation default | LEGACY; NOT SAFE TO DELETE |
| `datasets/processed/reviews_with_aspect_labels.csv` | processed output | Earlier weak aspect-label output | Derived from noisy `reviews_final.csv`; older than refined output | API fallback for latest negatives; no current writer command found | LEGACY; NOT SAFE TO DELETE |
| `datasets/processed/reviews_with_aspect_labels_refined.csv` | processed output | Refined weak aspect labels and confidence | Active SVM preparation source, but inherits unfiltered upstream rows | W `label_aspects_by_keywords.py`; R `prepare_svm_aspect_dataset.py`; preferred API latest-negative source | NEEDS VERIFICATION |
| `datasets/processed/indobert/train.csv` | split | IndoBERT train split (`67,573` rows) | Regenerated in MS-15D from canonical input; unique IDs, valid labels, and no shared-quality-filter rejection | W `prepare_indobert_dataset.py`; R `train_indobert.py`, Colab notebooks | CURRENT; REGENERATED MS-15D |
| `datasets/processed/indobert/validation.csv` | split | IndoBERT validation split (`14,480` rows) | Regenerated in MS-15D from canonical input; disjoint from train/test | W `prepare_indobert_dataset.py`; R `train_indobert.py`, Colab notebooks | CURRENT; REGENERATED MS-15D |
| `datasets/processed/indobert/test.csv` | split | IndoBERT test split (`14,481` rows) | Regenerated in MS-15D from canonical input; old Morse-like ID absent | W `prepare_indobert_dataset.py`; R `train_indobert.py`, Colab notebooks | CURRENT; REGENERATED MS-15D |
| `datasets/processed/indobert/label_mapping.json` | split metadata | Sentiment label-to-ID mapping | Regenerated with the MS-15D splits: Negative `0`, Neutral `1`, Positive `2` | W `prepare_indobert_dataset.py`; R training/Colab/export | CURRENT; REGENERATED MS-15D |
| `datasets/processed/svm/svm_aspect_dataset.csv` | processed model dataset | Filtered weak-label aspect dataset (`16,983` rows in current summary) | Not regenerated in MS-15D; old refined-label lineage remains and `6` IDs are not canonical | W `prepare_svm_aspect_dataset.py`; R `train_svm_aspect_classifier.py` | NEEDS VERIFICATION |

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
| `datasets/outputs/eda/03_indobert/indobert_dataset_summary.json`<br>`datasets/outputs/eda/03_indobert/indobert_label_distribution.csv`<br>`datasets/outputs/eda/03_indobert/indobert_label_distribution.json`<br>`datasets/outputs/eda/03_indobert/indobert_split_distribution.csv`<br>`datasets/outputs/eda/03_indobert/indobert_split_distribution.json`<br>`datasets/outputs/eda/03_indobert/indobert_text_length_summary.json` | output / split metadata | Current split-generation summary | Regenerated in MS-15D from all `96,534` canonical valid rows; no row removed during preparation | W `prepare_indobert_dataset.py`; service availability/reporting | CURRENT; REGENERATED MS-15D |
| `datasets/outputs/eda/03_indobert/run_1_baseline/indobert_dataset_summary.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_label_distribution.csv`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_label_distribution.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_split_distribution.csv`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_split_distribution.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_text_length_summary.json` | legacy evaluation metadata | Run 1 dataset snapshot | Historical duplicate; pre-quality-filter lineage | Notebook/report fallback | ARCHIVE LATER |
| `datasets/outputs/eda/03_indobert/run_1_baseline/indobert_training_metrics.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_classification_report.json`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_confusion_matrix.csv`<br>`datasets/outputs/eda/03_indobert/run_1_baseline/indobert_test_predictions.csv` | evaluation output | Baseline experiment metrics and predictions | Thesis evidence; metrics inherit historical data quality | API sentiment/report fallback; evaluation docs | KEEP |
| `datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_class_weights.json`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_classification_report.json`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_confusion_matrix.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_error_analysis.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_run_comparison.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_run_comparison.json`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_test_predictions.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_training_history.csv`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_training_history.json`<br>`datasets/outputs/eda/03_indobert/run_2_weighted_loss/indobert_training_metrics.json` | evaluation output | Historical weighted-loss experiment | Thesis evidence; not selected; pre-quality-filter metrics | API sentiment/report, notebooks, consolidated evaluation | KEEP; ARCHIVE LATER only after thesis evidence policy |
| `datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_class_weights.json`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_classification_report.json`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_confusion_matrix.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_error_analysis.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_run_comparison.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_run_comparison.json`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_test_predictions.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_training_history.csv`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_training_history.json`<br>`datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_training_metrics.json` | evaluation output | Selected historical IndoBERT run | Active reported metrics, but docs already state retraining is needed after filtered split regeneration | API sentiment/report, model evaluation, notebook 03 | KEEP; REGENERATE LATER |
| `datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_class_weights.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_classification_report.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_confusion_matrix.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_error_analysis.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_run_comparison.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_run_comparison.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_slang_normalization_samples.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_slang_normalization_summary.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_test_predictions.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_training_history.csv`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_training_history.json`<br>`datasets/outputs/eda/03_indobert/run_4_weighted_loss_lr_1e-5_slang_norm/indobert_training_metrics.json` | evaluation output | Slang-normalization experiment | Historical non-selected evidence; pre-quality-filter lineage | API/report comparison, notebook 03 | KEEP; ARCHIVE LATER only after thesis evidence policy |

### 3.8 EDA 04 - SVM Aspect Preparation and Experiments

| Path(s) | Type | Stage and role | Canonicality / noise | References | Status |
| --- | --- | --- | --- | --- | --- |
| `datasets/outputs/eda/04_svm/svm_aspect_dataset_summary.json`<br>`datasets/outputs/eda/04_svm/svm_aspect_label_distribution.csv`<br>`datasets/outputs/eda/04_svm/svm_aspect_label_distribution.json`<br>`datasets/outputs/eda/04_svm/svm_aspect_by_sentiment_distribution.csv`<br>`datasets/outputs/eda/04_svm/svm_aspect_by_sentiment_distribution.json`<br>`datasets/outputs/eda/04_svm/svm_aspect_confidence_distribution.csv`<br>`datasets/outputs/eda/04_svm/svm_aspect_confidence_distribution.json` | output / dataset metadata | Current weak-label SVM dataset summary/distributions | Not regenerated in MS-15D; based on `97,782` old-branch rows before narrowing to `16,983` | W `prepare_svm_aspect_dataset.py`; API `aspect-service` | NEEDS VERIFICATION |
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
| `dataset_spotify_indobert_stage.csv` and canonical noise reports | `preprocess_indobert.py` | `preprocess_svm.py` | Root-safe MS-15C intermediate; contains only `96,575` IndoBERT-stage-valid rows. |
| `dataset_spotify_processed.{csv,json}` and canonical noise reports | `preprocess_svm.py` | `prepare_indobert_dataset.py` reads canonical CSV after MS-15D | Root-safe canonical output defaults; valid and dropped rows remain separated. |
| `reviews_with_aspect_labels_refined.csv` | `label_aspects_by_keywords.py` | `prepare_svm_aspect_dataset.py`; review API latest-negative endpoint | Active SVM/review dependency blocks deletion. |
| `datasets/processed/indobert/*` and top-level EDA 03 summaries | `prepare_indobert_dataset.py` | `train_indobert.py`; `prepare_colab_indobert_bundle.py`; Colab notebooks | MS-15D regenerated current splits and summaries from canonical `dataset_spotify_processed.csv`. |
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
| `api-gateway-service` | No dataset CSV/JSON reads. It proxies services and persists runtime inference history separately. | Correct boundary retained; upstream connection details are redacted from public proxy errors. |
| `review-service GET /dataset/summary` | Canonical processed CSV, canonical noise report, raw acquisition/app metadata, EDA 01 missing-values, EDA 03 text summary | Reports `96,534` canonical valid, `97,782` input, and `1,248` dropped rows without artifact-presence fields. |
| `review-service GET /scraping/summary` | Raw scraping/data-acquisition summaries and quota JSON | Summary-only; no actual scraping sample rows. |
| `review-service GET /preprocessing/summary` | Canonical processed CSV/noise report plus EDA 02 relabeling, historical aspect, and general-fallback summaries | Exposes canonical valid/drop distributions; historical aspect evidence is explicitly `needs_verification`. |
| `review-service GET /reviews/random` | Canonical processed CSV; raw labeled CSV only as explicit fallback; optional historical aspect enrichment | Returns report fields for text, rating, date, sentiment, cleaned/model text, quality status, and qualified aspect labels. |
| `review-service GET /reviews/latest-negative` | Canonical processed rows plus optional refined/old aspect label lookup and raw author-name lookup | Text/quality lineage is canonical; aspect enrichment remains marked `needs_verification`. |
| `sentiment-service GET /sentiment/summary` | Regenerated EDA 03 canonical label distribution and EDA 01 raw distribution | Final distribution sums to `96,534` canonical rows. |
| `sentiment-service GET /sentiment/evaluation` | EDA 05 and EDA 03 historical run metrics/reports | Reported as `historical_pre_canonical_retraining_required`; artifact path fields are removed. |
| `aspect-service GET /aspects/summary` | EDA 04 SVM dataset summary, taxonomy, final selection, aspect/sentiment CSV | Active weak-label/model summary with `needs_verification` lineage status. |
| `aspect-service GET /aspects/evaluation` | EDA 04 scenario metrics/reports and EDA 05 | Historical old-lineage evaluation with `needs_verification` status. |
| `report-service` | EDA 03-08 summaries, selected model/taxonomy, ranking CSV | Feeds Dashboard/Evaluation/AHP with semantic lineage/sample status; internal paths and availability maps are not public. |
| `decision-service` | No review dataset artifact read found in service calculations. | AHP/Fuzzy AHP calculation code is separate from review artifact lineage. |

### 4.4 Frontend Indirect Dependencies

The frontend reads no CSV/JSON directly. It depends on API fields derived from artifacts:

| Frontend service/page | API dependency | Underlying artifact family |
| --- | --- | --- |
| Dataset | `/dataset/summary`, `/reviews/random` | Canonical processed dataset/noise report plus raw acquisition and EDA 01 metadata |
| Scraping | `/scraping/summary`, `/reviews/random` | Raw acquisition summaries plus generic review samples |
| Preprocessing | `/preprocessing/summary`, `/reviews/random` | Canonical valid/drop metadata, EDA 02 lineage summaries, and canonical samples |
| Sentiment Analysis | `/sentiment/summary`, `/sentiment/evaluation`, `/reviews/random` | Canonical EDA 03 distribution, historical EDA 05 metrics, and canonical samples |
| Aspect Classification | `/aspects/summary`, `/aspects/evaluation`, `/reviews/random` | Historical EDA 04/05 marked `needs_verification`; optional weak-label sample enrichment |
| Model Evaluation | `/evaluation/summary` | EDA 05 through report-service |
| Dashboard | All summary APIs, latest negative reviews, ranking comparison | Raw, EDA 01-05/08, refined aspect labels |
| AHP/Fuzzy AHP | `/ahp/criteria`, `/evaluation/summary`, `/reports/ranking-comparison` | Decision-service criteria and EDA 04/05/08 |
| Uji Ulasan | `/inference/review`, `/inference/history` | Runtime model inference and API Gateway database; not research CSV lineage |

### 4.5 Documentation Drift

| File | Ambiguity |
| --- | --- |
| `ml-service/notebooks/02_preprocessing.ipynb` | Documents only the old unfiltered processed chain. |
| `docs/microservices/review-service-extraction.md` | Calls `reviews_final.csv` the preferred review source without quality caveat. |
| `docs/microservices/api-contract.md` | Resolved in MS-15E: defines canonical semantic contracts and excludes internal artifact diagnostics. |
| `docs/ml/indobert-artifact-export.md` | Correctly treats existing run_3 model metrics as historical; MS-15D regenerated the input splits but did not retrain the model. |
| `docs/microservices/repository-hygiene-audit.md` | Classifies `quality_audit/` as research evidence, not as a candidate source requiring promotion. |
| `docs/microservices/architecture.md` | Defines artifact policy but not the canonical processed filename or lineage version. |

At MS-15A, no audited document declared a single canonical processed dataset and its derivation contract. MS-15B through MS-15E updates in this document now record that contract and the current migration status.

## 5. Current Pipeline Lineage Map

### 5.1 Actual Active Lineage

```text
datasets/raw/reviews_rating_{1..5}_raw.csv
  -> label_by_rating.py
  -> datasets/raw/reviews_raw_labeled.csv
  -> relabel_by_keywords.py
  -> datasets/processed/reviews_relabelled.csv                 [noise still expected]
  -> preprocess_indobert.py
  -> datasets/processed/dataset_spotify_indobert_stage.csv
  -> preprocess_svm.py
  -> datasets/processed/dataset_spotify_processed.csv          [96,534 canonical valid]
  -> prepare_indobert_dataset.py
  -> datasets/processed/indobert/{train,validation,test}.csv   [regenerated MS-15D]
  -> train_indobert.py / Colab                                 [not run in MS-15D]
  -> datasets/outputs/eda/03_indobert/run_*/                   [historical model runs]

datasets/processed/reviews_final.csv                           [confirmed noisy legacy]
  -> label_aspects_by_keywords.py
  -> datasets/processed/reviews_with_aspect_labels_refined.csv [old branch; NEEDS VERIFICATION]
  -> prepare_svm_aspect_dataset.py
  -> datasets/processed/svm/svm_aspect_dataset.csv             [not regenerated MS-15D]
  -> train_svm_aspect_classifier.py
  -> datasets/outputs/eda/04_svm/                              [historical/current old lineage]

EDA 01-05 + EDA 08
  -> domain service summary APIs
  -> API Gateway
  -> frontend Dashboard/Dataset/Sentiment/Aspect/Evaluation/AHP pages
```

### 5.2 Canonical Preprocessing Defaults After MS-15C

```text
datasets/processed/reviews_relabelled.csv
  -> preprocess_indobert.py
  -> datasets/processed/dataset_spotify_indobert_stage.csv      [96,575 valid]
  +  datasets/processed/dataset_spotify_noise_report.{csv,json} [1,207 dropped]
  -> preprocess_svm.py
  -> datasets/processed/dataset_spotify_processed.{csv,json}    [96,534 valid]
  +  datasets/processed/dataset_spotify_noise_report.{csv,json} [1,248 cumulative dropped]
```

The old `ml-service/quality_audit/` files remain lineage evidence, not default final outputs. MS-15D migrated IndoBERT preparation. MS-15E migrated backend review and sentiment readers; SVM aspect-label preparation remains unchanged pending verified follow-up work.

### 5.3 Expected Versus Actual Gap

| Expected step | Actual repository state | Gap |
| --- | --- | --- |
| Quality filtering produces canonical processed data | Scripts now reproduce `dataset_spotify_processed.{csv,json}` and canonical noise reports | Resolved in MS-15B/MS-15C |
| IndoBERT splits derive from canonical valid data | All `96,534` canonical rows are partitioned into regenerated train/validation/test splits | Resolved in MS-15D |
| SVM labels/dataset derive from canonical valid data | Canonical input lacks weak-label columns; refined labels and SVM dataset still derive from old branch | `NEEDS VERIFICATION` |
| Backend preprocessing summary reports valid/dropped counts | Canonical processed/noise reports provide `96,534` valid and `1,248` dropped rows with reason/stage distributions | Resolved in MS-15E |
| Backend review samples expose canonical preprocessing fields | Sample schema now includes cleaned/model text, quality status/reason, lengths, and qualified aspect fields | Backend resolved in MS-15E; frontend mapping deferred to MS-15F |

## 6. Noise/Gibberish Finding

### 6.1 Confirmed Evidence

| Evidence | Result |
| --- | --- |
| `preprocess_indobert_quality_summary.json` | `97,782` input; `96,575` valid; `1,207` dropped |
| IndoBERT drop reasons | 905 too short, 203 high symbol ratio, 45 too few alphabet chars, 39 repeated garbage, 13 high digit ratio, 2 Morse-like |
| `preprocessing_quality_summary.json` | `96,575` input; `96,534` valid; 41 additional drops |
| `reviews_final.csv` targeted sample | Emoji-only row `f4a4d23f-...` remains |
| `reviews_final.csv` targeted sample | Morse-like row `1b2b73e6-...` remains |
| MS-15D IndoBERT splits | All `96,534` canonical IDs present exactly once; zero overlap, empty text, invalid label mapping, or quality-detector rejection |
| Old noisy IndoBERT IDs | Morse-like `1b2b73e6-...` and SVM-stage-dropped `96e6b8f5-...` are absent after regeneration |
| `reviews_final_quality_filtered.csv` | Known dropped IDs absent; sampled rows show `preprocessing_status=valid` and `drop_reason=valid` |

### 6.2 Interpretation

- Noise in raw and relabeled files is not itself a defect; those are pre-filter stages.
- Noise in `reviews_final.csv` is a contract defect because its name and active consumers imply a clean final dataset.
- The quality audit is conservative and auditable, but this audit did not re-run it or prove every retained row is semantically valid.
- `reviews_final_quality_filtered.csv` was the verified promotion source; `dataset_spotify_processed.{csv,json}` is now canonical.

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
- no committed active consumer read the canonical path at MS-15B; preparation and backend readers migrated in MS-15D/MS-15E;
- aspect labels must be regenerated from it rather than copied from the old branch;
- model-specific splits and evaluation outputs must be regenerated.

MS-15B decision: promoted. The audit source remains in place as lineage evidence. Reader migration and deterministic script output belong to MS-15C and later milestones.

## 8. Backend/API Dependency Findings

| Finding | Impact | Priority |
| --- | --- | --- |
| Random and latest-negative review text now comes from the canonical processed dataset. | Known noisy legacy rows are excluded from public sample text. | Resolved MS-15E |
| Optional aspect enrichment still reads historical refined/old weak labels by canonical ID. | Aspect values remain useful but cannot be presented as canonical SVM truth. | `NEEDS VERIFICATION` |
| Preprocessing API reads canonical processed/noise reports. | Valid/drop totals, drop reasons, stages, cleaned text, and quality status are report-ready. | Resolved MS-15E |
| Sentiment summary uses regenerated canonical EDA 03 distribution. | Final counts describe all `96,534` canonical rows. | Resolved MS-15E |
| IndoBERT evaluation artifacts still predate the canonical split regeneration. | Metrics cannot be represented as canonical-trained results. | `historical_pre_canonical_retraining_required` |
| SVM summaries derive from the old refined weak-label dataset. | Selected metrics need regeneration after canonical weak-label lineage is approved. | `NEEDS VERIFICATION` |
| Public research summaries previously exposed artifact availability and paths. | Internal repository diagnostics leaked through API/Gateway responses. | Resolved MS-15E |
| Review samples now expose reusable preprocessing and aspect fields. | Backend supports later frontend mapping without dummy data. | Resolved MS-15E |
| API Gateway does not read datasets directly. | Correct architecture boundary; fixes belong in domain APIs, not gateway file parsing. | KEEP |

## 9. Frontend Mismatch Findings

MS-15E stabilized backend fields, but did not modify frontend consumers. Remaining `"-"` values therefore require an MS-15F mapping audit: some fields are now available under semantic API names, while other requested values have no source and must remain honest empty states.

| Page | Likely mismatch | Result |
| --- | --- | --- |
| Dashboard | Cleaned text is now available; app version and several ranking interpretation fields are not. | Map cleaned text in MS-15F; retain empty states for unsupported fields. |
| Dataset | Frontend expects thumbs-up/app-version and removed artifact-availability diagnostics. | Replace diagnostic rendering with canonical counts/status; unsupported sample fields remain empty. |
| Scraping | Uses `/reviews/random` as a scraping preview but requests `scrape_request_id`, `scraped_at`, and `scraping_status`. | Most scraping-specific columns are unavailable or synthesized. |
| Preprocessing | Cleaned text, before/after lengths, drop reason, and status now exist in review samples; canonical drop aggregates exist in summary. | Frontend mapping remains MS-15F; canonical valid samples correctly have `preprocessing_status=valid`. |
| Sentiment Analysis | Requests cleaned text, predicted sentiment, confidence, and prediction source from historical review samples. | Final weak/relabel sentiment may appear, but runtime-model columns are `-`. |
| Aspect Classification | Cleaned text and weak-label confidence/status are available, but historical samples are not runtime SVM predictions. | Map with visible `needs_verification` provenance; do not fabricate prediction source. |
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

All four proposed `dataset_spotify_*` files exist after MS-15B, and the IndoBERT files were regenerated in MS-15D. The three proposed SVM split/mapping files do not exist; creating them is deferred until canonical weak-label lineage is verified.

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
| MS-15D | Regenerate IndoBERT from canonical data; regenerate SVM only if the weak-label lineage is safe without assumption changes. | `prepare_indobert_dataset.py`, `datasets/processed/indobert/`, EDA 03 summaries/figures, lineage audit; SVM files only if verified | Split drift, label distribution drift, weak-label changes | Split overlap checks; count/distribution checks; known-noise absence; deterministic seed rerun; SVM schema/ID audit |
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
| Deleting `reviews_final.csv` breaks review APIs and the current aspect-label branch | High | High | Migrate remaining readers first; retain compatibility only temporarily. |
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
| `datasets/processed/reviews_final.csv` | Legacy evidence and upstream input to the unresolved aspect-label lineage; no longer a public review API or IndoBERT preparation default. |
| `reviews_with_aspect_labels.csv` and `reviews_with_aspect_labels_refined.csv` | Optional aspect enrichment and active SVM preparation lineage; values remain `needs_verification`. |
| `datasets/processed/indobert/*` | Regenerated canonical training/Colab inputs; retain as active derived artifacts. |
| `datasets/processed/svm/svm_aspect_dataset.csv` | Active SVM training input. |
| `ml-service/quality_audit/*` | Only current evidence of filtering behavior and canonical candidate data. |
| EDA 01-05 summaries | Active backend/API/frontend dependencies. |
| EDA 03/04 historical run outputs | Thesis experiment evidence and service fallback comparisons. |
| EDA 06-08 sample/validation/aggregation outputs | Active AHP/Fuzzy AHP sample status and ranking display. |

`reviews_preprocessed_indobert.json` and old intermediate CSVs may be archive candidates, but they are not safe to remove until MS-15I proves no notebook, manual workflow, or reproducibility requirement remains.

## 14. Immediate Next Step Recommendation

Keep the MS-15D IndoBERT splits as current canonical derived inputs. Do not present historical run_3 metrics as clean-data metrics; retraining remains a separate approval.

Before regenerating SVM, establish one reviewed canonical weak-label step that consumes `dataset_spotify_processed.csv`, preserves the existing seven-label weak taxonomy and confidence rules, and produces label/distribution evidence without copying unverified rows from the legacy branch. Current classification: IndoBERT derived dataset is `CURRENT / REGENERATED MS-15D`; SVM derived dataset is `NEEDS VERIFICATION`.

For application delivery, proceed with MS-15F frontend mapping against the stabilized semantic fields. Do not reintroduce artifact-presence flags or substitute dummy values for unsupported fields.

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

During MS-15B, legacy processed files, model-specific splits, scripts, notebooks, services, frontend, Docker, models, and datasets outside the four canonical targets were left unchanged. MS-15C later changed only the two preprocessing scripts documented below. Old files remain necessary until reader migration and split regeneration are complete.

## 16. MS-15C Preprocessing Script Output Cleanup

### 16.1 Default Ownership

| Script | Default input | Default output ownership |
| --- | --- | --- |
| `preprocess_indobert.py` | Legacy intermediate `datasets/processed/reviews_relabelled.csv` | `dataset_spotify_indobert_stage.csv`; first-stage canonical noise CSV/JSON |
| `preprocess_svm.py` | `dataset_spotify_indobert_stage.csv` | Final `dataset_spotify_processed.csv`, `dataset_spotify_processed.json`, and cumulative canonical noise CSV/JSON |

All defaults resolve from each script's repository location, not the process working directory. Existing CLI option names remain available. `--output` on `preprocess_svm.py` is now an optional secondary stage export; `--metrics-dir`, `--figures-dir`, and `--summary-output` are opt-in diagnostics and never replace canonical output.

### 16.2 Reproduction Commands

From repository root:

```powershell
ml-service/.venv/Scripts/python.exe ml-service/scripts/preprocess_indobert.py
ml-service/.venv/Scripts/python.exe ml-service/scripts/preprocess_svm.py
```

The first command reports `97,782` total, `96,575` valid, and `1,207` dropped rows. The second reports `96,575` total, `96,534` valid, `41` additionally dropped, and `1,248` cumulative noise-report rows.

### 16.3 Validation and Remaining Drift

Fresh full-run validation confirmed:

- canonical CSV and JSON each contain `96,534` unique valid rows;
- no empty cleaned text, non-valid status, Morse-like text, symbol-heavy text, digit-heavy text, or repeated-garbage rejection remains under the current shared detector;
- canonical processed CSV remains byte-identical to the MS-15B promotion source;
- canonical noise CSV/JSON each contain `1,207` IndoBERT-stage and `41` SVM-stage rows;
- valid and dropped IDs are disjoint and exactly partition all `97,782` relabeled rows;
- deterministic LF normalization for embedded text line endings preserves the MS-15B canonical hashes;
- legacy files were not renamed, overwritten, or deleted.

Remaining old references are intentional: aspect-label/SVM preparation, notebooks, and historical aspect/report summaries still consume old-lineage artifacts. IndoBERT preparation migrated in MS-15D; backend review/sentiment readers migrated in MS-15E; canonical SVM migration remains blocked on verified weak-label lineage.

## 17. MS-15D Model Dataset Regeneration Result

### 17.1 IndoBERT Regeneration

`prepare_indobert_dataset.py` now defaults to `datasets/processed/dataset_spotify_processed.csv`. Running it from the repository root regenerated only the dataset-preparation artifacts; no training or model export ran.

| Check | Result |
| --- | --- |
| Canonical input rows | `96,534` |
| Prepared rows | `96,534`; zero status, label, or empty-text removals |
| Train split | `67,573` rows: Negative `27,590`, Neutral `12,099`, Positive `27,884` |
| Validation split | `14,480` rows: Negative `5,912`, Neutral `2,593`, Positive `5,975` |
| Test split | `14,481` rows: Negative `5,913`, Neutral `2,593`, Positive `5,975` |
| Label mapping | Negative `0`, Neutral `1`, Positive `2` |
| ID coverage | `96,534` unique IDs; exact canonical ID set; zero cross-split overlap |
| Text quality | Zero empty `text_indobert`; zero shared-detector rejections, including Morse-like and symbol-heavy text |
| Metadata | Zero non-`valid` preprocessing statuses or drop reasons |

Regenerated outputs:

- `datasets/processed/indobert/{train,validation,test}.csv`
- `datasets/processed/indobert/label_mapping.json`
- top-level `datasets/outputs/eda/03_indobert/indobert_*` dataset summaries/distributions
- top-level `docs/figures/03_indobert/indobert_*` dataset figures

Historical run folders under EDA 03 and their model figures were not regenerated because MS-15D did not train or evaluate IndoBERT.

### 17.2 SVM Audit and Blocker

Status: `NEEDS VERIFICATION`. SVM preparation was not run and no SVM derived artifact was changed.

Exact blockers:

1. `prepare_svm_aspect_dataset.py` requires `text_svm`, `aspect_label`, and `aspect_label_confidence`. Canonical input contains `text_svm` but not the two weak-label columns, so direct canonical input violates the script contract.
2. The default input remains `reviews_with_aspect_labels_refined.csv`, which has `97,782` old-branch rows. It contains all canonical IDs plus `1,248` IDs excluded by canonical quality filtering.
3. The current `16,983`-row SVM dataset contains `6` IDs absent from canonical data.
4. Shared canonical/refined IDs have matching `text_svm` and `final_sentiment`, but that does not establish a canonical weak-label artifact or prove that copying labels from the old branch is the approved reproducible lineage.
5. Regenerating the weak-label source would also affect EDA 02 aspect-label outputs and must be reviewed as an explicit canonical label-generation step before EDA 04/SVM regeneration.

No label scheme was changed or inferred. The existing SVM dataset, EDA 04 summaries, and SVM figures remain historical/current old-lineage evidence until this blocker is resolved.

## 18. MS-15E Backend Research Artifact API Result

### 18.1 Canonical Public Readers

| Contract | MS-15E result |
| --- | --- |
| Dataset summary | `96,534` canonical valid rows, `97,782` acquisition rows, `1,248` dropped rows, canonical rating/sentiment distributions, and canonical review period |
| Preprocessing summary | Canonical valid/drop totals plus drop-reason and quality-stage distributions; historical aspect summary marked `needs_verification` |
| Random/latest-negative samples | Canonical review text, rating, date, sentiment, cleaned/model text, preprocessing status/reason, and lengths; optional weak aspect labels carry `aspect_data_status=needs_verification` |
| Sentiment summary | Canonical regenerated EDA 03 distribution: Negative `39,415`, Neutral `17,285`, Positive `39,834` |
| Sentiment evaluation | Existing run metrics retained as thesis evidence and marked `historical_pre_canonical_retraining_required` |
| Aspect summary/evaluation | Existing SVM outputs retained without regeneration and marked `needs_verification` |
| Consolidated report/evaluation | Includes explicit IndoBERT/SVM lineage status and semantic AHP/Fuzzy AHP sample/final status |

Raw acquisition data remains valid for scraping/acquisition context and as an explicitly warned review-sample fallback only when canonical data is unavailable. The noisy `reviews_final.csv` is not a default public reporting source.

### 18.2 Public Contract Boundary

Research summary, sample, evaluation, and ranking responses no longer expose artifact paths, internal filenames, file/directory existence maps, configured model paths, or upstream service URLs. File-read failures return generic warnings and empty semantic values. Domain router and API Gateway failures retain stable codes/messages with empty public `details`; operational path/configuration diagnostics remain limited to existing health/settings-style endpoints.

The API Gateway remains the only frontend-facing entry and does not read research CSV/JSON artifacts directly.

### 18.3 Remaining Status

- IndoBERT datasets: `CURRENT / REGENERATED MS-15D`.
- IndoBERT trained-model evaluation: `historical_pre_canonical_retraining_required`; no training occurred.
- SVM datasets/evaluation: `NEEDS VERIFICATION`; no regeneration or training occurred.
- Frontend field mapping: deferred to MS-15F; no frontend file changed in MS-15E.
- Legacy datasets, generated outputs, saved models, Docker, and notebooks were not modified by MS-15E.

## 19. MS-15I Legacy Artifact Archive

### 19.1 Decision Summary

| Question | Finding | Confidence |
| --- | --- | --- |
| `datasets/processed/reviews_preprocessed_indobert.csv` | No code reference; old unfiltered IndoBERT intermediate from pre-MS-15C pipeline | Safe to archive |
| `datasets/processed/reviews_preprocessed_indobert.json` | No code reference; duplicate JSON of the same legacy intermediate | Safe to archive |
| `datasets/processed/reviews_preprocessed_svm.csv` | No code reference; old unfiltered SVM intermediate from pre-MS-15C pipeline | Safe to archive |
| `datasets/processed/reviews_final.csv` | Still referenced by `train_indobert.py` as `DEFAULT_INPUT_DATASET` | KEEP — active code dependency |
| `datasets/processed/reviews_relabelled.csv` | Read by `preprocess_indobert.py` as `DEFAULT_INPUT` | KEEP — active code dependency |
| `datasets/processed/reviews_with_aspect_labels.csv` | API fallback for latest negatives | KEEP — active service dependency |
| `datasets/processed/reviews_with_aspect_labels_refined.csv` | Read by `prepare_svm_aspect_dataset.py` | KEEP — active code dependency |
| `ml-service/quality_audit/*` | Read by `train_indobert.py` as training provenance (noise reports + quality summary) | KEEP — active code dependency |
| `datasets/processed/dataset_spotify_indobert_stage.csv` | Generated by `preprocess_indobert.py`, untracked, reproducible | KEEP — regenerated by script |

### 19.2 Archive Actions

| Source | Destination | Reason |
| --- | --- | --- |
| `datasets/processed/reviews_preprocessed_indobert.csv` | `datasets/archive/processed_legacy/reviews_preprocessed_indobert.csv` | No active reader; legacy unfiltered intermediate |
| `datasets/processed/reviews_preprocessed_indobert.json` | `datasets/archive/processed_legacy/reviews_preprocessed_indobert.json` | No active reader; duplicate JSON |
| `datasets/processed/reviews_preprocessed_svm.csv` | `datasets/archive/processed_legacy/reviews_preprocessed_svm.csv` | No active reader; legacy unfiltered intermediate |

### 19.3 Files Marked KEEP UNTIL REFACTOR

| File | Blocking reference |
| --- | --- |
| `datasets/processed/reviews_final.csv` | `train_indobert.py` `DEFAULT_INPUT_DATASET` |
| `datasets/processed/reviews_relabelled.csv` | `preprocess_indobert.py` `DEFAULT_INPUT` |
| `datasets/processed/reviews_with_aspect_labels.csv` | `review-service` API fallback |
| `datasets/processed/reviews_with_aspect_labels_refined.csv` | `prepare_svm_aspect_dataset.py` input |
| `ml-service/quality_audit/*` (all 12 files) | `train_indobert.py` provenance reads |

### 19.4 Verification

- `rg -l 'reviews_preprocessed_indobert|reviews_preprocessed_svm'` across all code: **0 matches**
- `python -m compileall ml-service/scripts`: **exit 0**
- `git status --short`: only `datasets/archive/` as new untracked directory
- No frontend/backend logic modified.
- No model binary, dataset canonical file, or thesis evidence file modified.
