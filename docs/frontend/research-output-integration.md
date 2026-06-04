# FE-15 Research Output Data Integration

## Purpose

Dokumen ini mencatat integrasi ringkasan output riset ke frontend SentiRank untuk kebutuhan demo skripsi. FE-15 mengganti data mock generik pada halaman utama dengan ringkasan dari artefak proyek, tetapi tetap mempertahankan mock fallback untuk tabel/preview yang belum memiliki data baris penuh di frontend.

## Source Artifacts Inspected

- `docs/methodology/model_evaluation_summary.md`
- `docs/methodology/svm_aspect_classifier_finalization.md`
- `docs/methodology/ahp_fuzzy_ahp_design.md`
- `docs/figures/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_confusion_matrix.png`
- `docs/figures/04_svm/svm_merged_5class_confusion_matrix.png`
- `docs/figures/05_evaluation/*`
- `ml-service/notebooks/01_data_acquisition.ipynb`
- `ml-service/notebooks/02_preprocessing.ipynb`
- `ml-service/notebooks/03*_indobert*.ipynb`
- `ml-service/notebooks/04_svm_aspect_classification.ipynb`
- `ml-service/notebooks/05_model_evaluation.ipynb`
- `datasets/outputs/eda/01_data_acquisition/*`
- `datasets/outputs/eda/02_preprocessing/*`
- `datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/*`
- `datasets/outputs/eda/04_svm/*`
- `datasets/outputs/eda/05_evaluation/model_evaluation_summary.json`

## Integrated Research Data

Ringkasan riset dipusatkan di `frontend/lib/research-results.ts`.

### Dataset Summary

- Total ulasan: `97.782`.
- Source package: `com.spotify.music`.
- App title: `Spotify: Music dan Podcast`.
- Source id: `google_play_spotify_id`.
- Date range: `2014-07-06T20:34:44` sampai `2026-05-13T02:16:04`.
- Duplicate `external_id`: `0`.
- Missing `external_id`, `rating`, `content`, dan `reviewed_at`: `0`.
- Rating distribution: rating 1 `20.000`, rating 2 `15.000`, rating 3 `27.782`, rating 4 `15.000`, rating 5 `20.000`.
- Final label distribution: Negative `39.686`, Neutral `17.629`, Positive `40.467`.

### Scraping Summary

- Target ulasan: `100.000`.
- Terkumpul: `97.782`.
- Batch strategy: pengambilan data dibagi berdasarkan rating.
- Quota achievement: rating 1 `100%`, rating 2 `100%`, rating 3 `92,61%`, rating 4 `100%`, rating 5 `100%`.
- Frontend tidak menjalankan scraping runtime.

### Preprocessing Summary

- Total rows: `97.782`.
- Empty text IndoBERT: `0`.
- Empty text SVM: `91`.
- Changed label count: `10.153` atau `10,3833%`.
- Audit candidate count: `6.853`.
- Rows with keyword match: `53.515`.
- Final SVM aspect dataset rows: `16.983`.
- Removed low confidence rows: `36.532`.
- Removed general rows: `44.176`.

### IndoBERT Evaluation

- Final candidate: `run_3_weighted_loss_lr_1e-5`.
- Accuracy: `0,7362285246795746`.
- Macro Precision: `0,7085677044571099`.
- Macro Recall: `0,7234010488718962`.
- Macro F1: `0,7093262951288682`.
- Weighted F1: `0,7444675721927735`.
- Neutral F1: `0,5562036891`.
- Support: `14.668`.
- Confusion matrix reference: `docs/figures/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_confusion_matrix.png`.

### SVM Evaluation

- Final classifier: `merged_5class`.
- Accuracy: `0,950207468879668`.
- Macro Precision: `0,9341269083471747`.
- Macro Recall: `0,9402876428365226`.
- Macro F1: `0,9367812076632358`.
- Weighted F1: `0,9501424835741542`.
- Minimum class F1: `0,8898305085`.
- Support: `2.410`.
- Confusion matrix reference: `docs/figures/04_svm/svm_merged_5class_confusion_matrix.png`.

### Aspect Summary

- Final classifier: `merged_5class`.
- Final aspect dataset rows: `16.983`.
- Final criteria count: `5`.
- Merged aspect distribution: Features, Content & Audio Experience `7.986`, Ads Experience `4.691`, Subscription & Pricing `2.840`, App Reliability & Usability `826`, Account/Login `640`.
- Negative aspect distribution: Ads Experience `10.564`, Features, Content & Audio Experience `8.499`, Subscription & Pricing `6.944`, App Reliability & Usability `1.974`, Account/Login `1.131`.

## Unavailable / TBD Data

- Contoh before/after text preprocessing spesifik belum ditemukan sebagai artefak ringkas frontend, sehingga ditandai `TBD` dan `Belum tersedia di artefak frontend`.
- Final expert judgement AHP/Fuzzy AHP belum tersedia. Output AHP/Fuzzy AHP FE-13 tetap `sample_development_only`, `not_final_expert_judgement`, dan bukan hasil final skripsi.
- Dataset mentah baris penuh tidak dimuat ke frontend pada FE-15; tabel ulasan tetap memakai mock fallback.

## Affected Pages

- `/dashboard`
- `/dataset`
- `/scraping`
- `/preprocessing`
- `/sentiment-analysis`
- `/aspect-classification`
- `/model-evaluation`
- `/reports`

## Limitations

- FE-15 hanya mengintegrasikan ringkasan riset, bukan real API halaman dataset/sentimen/aspek.
- FE-15 tidak melakukan training model dan tidak menjalankan notebook.
- FE-15 tidak mengubah backend calculation logic, Prisma schema, migration, auth, userId/sessionId, atau service AHP/Fuzzy AHP.
- Mock fallback tetap dipertahankan untuk UI preview yang belum memiliki artefak data baris penuh.

## Next Phase Recommendation

Fase berikutnya sebaiknya mengarah ke integrasi data runtime bertahap untuk dataset/sentimen/aspek/evaluasi melalui service layer FE-12, atau finalisasi expert judgement AHP/Fuzzy AHP sebelum menampilkan hasil prioritas sebagai output final skripsi.

## FE-15 Acceptance Criteria

- [x] Research summary values dipusatkan di satu file.
- [x] Halaman demo utama memakai ringkasan riset.
- [x] Data riset, mock fallback, dan sample development AHP/Fuzzy AHP dibedakan jelas.
- [x] Nilai tidak tersedia ditandai TBD.
- [x] Mock fallback FE-07 dan API demo FE-13 tetap tersedia.
- [x] Tidak ada perubahan backend, training model, Prisma, auth, userId/sessionId, atau kalkulasi AHP/Fuzzy AHP frontend.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.
