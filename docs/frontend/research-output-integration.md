# FE-15 Research Output Data Integration

## Purpose

Dokumen ini mencatat integrasi ringkasan output riset ke frontend SentiRank untuk kebutuhan demo skripsi. FE-15 mengganti data mock generik pada halaman utama dengan ringkasan dari artefak proyek, memakai sampel riset nyata untuk tabel kecil, dan tetap mempertahankan fallback lokal ketika backend demo tidak aktif.

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
- Dataset mentah baris penuh tidak dimuat ke frontend pada FE-15; tabel ulasan memakai sampel riset kecil atau endpoint random review yang hanya mengembalikan limit sampel.

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

- FE-15 hanya mengintegrasikan ringkasan riset dan endpoint sampel random terbatas, bukan integrasi API penuh untuk halaman dataset/sentimen/aspek.
- FE-15 tidak melakukan training model dan tidak menjalankan notebook.
- FE-15 tidak mengubah backend calculation logic, Prisma schema, migration, auth, userId/sessionId, atau service AHP/Fuzzy AHP.
- Mock fallback tetap dipertahankan untuk UI preview yang belum memiliki artefak data baris penuh.

## FE-15B — Dataset EDA Metrics Visualization Integration

### EDA Files Inspected

Path yang diminta `dataset/output/eda` dan `datasets/output/eda` tidak ditemukan. Path aktual yang tersedia adalah:

```txt
datasets/outputs/eda
```

File dan folder EDA yang diperiksa:

- `datasets/outputs/eda/01_data_acquisition/*.csv`
- `datasets/outputs/eda/01_data_acquisition/*.json`
- `datasets/outputs/eda/02_preprocessing/*.csv`
- `datasets/outputs/eda/02_preprocessing/*.json`
- `datasets/outputs/eda/04_svm/*.csv`
- `datasets/outputs/eda/04_svm/*.json`
- `docs/figures/01_data_acquisition/*.png`
- `docs/figures/02_preprocessing/*.png`
- `ml-service/notebooks/01_data_acquisition.ipynb`
- `ml-service/notebooks/02_preprocessing.ipynb`

### CSV/JSON Metrics Used

FE-15B menambahkan sumber data terpusat:

```txt
frontend/lib/research-eda-results.ts
```

Metrik EDA yang digunakan:

- `rating_distribution_raw.csv/json`
- `sentiment_distribution_raw.csv/json`
- `missing_value_summary.csv/json`
- `text_length_summary_raw.json`
- `text_length_histogram_raw.csv`
- `temporal_distribution_monthly_raw.csv/json`
- `temporal_distribution_monthly_by_rating.csv/json`
- `label_distribution_before_relabeling.csv/json`
- `label_distribution_after_relabeling.csv/json`
- `text_length_before_after_cleaning.csv/json`
- `aspect_label_distribution_refined.csv/json`
- `aspect_by_sentiment_distribution_refined.csv/json`
- `aspect_label_confidence_distribution.csv/json`
- `general_fallback_analysis.json`
- `general_fallback_terms.csv`
- `aspect_taxonomy_candidate_terms.csv`
- `aspect_taxonomy_derivation_summary.json`
- `svm_aspect_confidence_distribution.csv/json`
- `final_aspect_taxonomy_for_ahp.json`

### Figures Referenced

PNG figures tidak di-OCR dan tidak dipakai untuk mengarang angka. Figures hanya dicatat sebagai artefak pendukung:

- `docs/figures/01_data_acquisition/rating_distribution_raw.png`
- `docs/figures/01_data_acquisition/sentiment_distribution_raw.png`
- `docs/figures/01_data_acquisition/temporal_distribution_raw.png`
- `docs/figures/01_data_acquisition/temporal_distribution_by_rating_raw.png`
- `docs/figures/01_data_acquisition/text_length_histogram_raw.png`
- `docs/figures/02_preprocessing/label_distribution_before_relabeling.png`
- `docs/figures/02_preprocessing/label_distribution_after_relabeling.png`
- `docs/figures/02_preprocessing/aspect_label_distribution_refined.png`
- `docs/figures/02_preprocessing/aspect_by_sentiment_distribution_refined.png`
- `docs/figures/02_preprocessing/general_fallback_top_terms.png`

### Dataset Page Changes

Halaman `/dataset` sekarang dikelompokkan menjadi:

1. Ringkasan Dataset.
2. Kualitas Data.
3. Distribusi Rating dan Sentimen.
4. Distribusi Temporal.
5. Analisis Panjang Teks.
6. Distribusi Aspek.
7. Artefak EDA.

Visualisasi baru mencakup chart distribusi rating, chart sentimen final, chart temporal tahunan, chart temporal bulanan per rating, histogram panjang teks mentah, tabel label sebelum/sesudah relabeling, tabel panjang teks before/after cleaning, tabel aspek berdasarkan sentimen, tabel top general/candidate terms, dan tabel referensi artefak.

### Dashboard and Reports Changes

- `/dashboard` mendapat `Ringkasan EDA Dataset` berisi review mentah, dataset aspek, puncak temporal, dan median panjang teks.
- `/reports` mendapat metrik EDA tambahan pada `Metrik Kunci` dan ringkasan insight dataset: dataset aspek SVM, median panjang teks, duplikasi external_id, puncak temporal, dan General fallback.

### Metrics Unavailable or Skipped

- Path `dataset/output/eda` dan `datasets/output/eda` tidak ada; yang digunakan adalah `datasets/outputs/eda`.
- Raw dataset CSV besar di `datasets/raw` dan `datasets/processed` tidak dimuat ke frontend agar halaman tetap ringan.
- PNG figures tidak dipakai sebagai sumber angka karena tidak dilakukan OCR atau inferensi visual.
- Metrik model IndoBERT/SVM di folder `03_indobert`, `04_svm`, dan `05_evaluation` tetap berada pada FE-15 utama; FE-15B fokus pada EDA dataset.

### Limitations

- FE-15B memetakan metrik yang sudah ada menjadi data frontend statis; belum membaca file CSV/JSON runtime.
- FE-15B tidak menjalankan ulang notebook, scraping, preprocessing, training, atau backend service.
- Aspect dan candidate terms tetap weak-label/exploratory dan tidak boleh diperlakukan sebagai final expert judgement AHP/Fuzzy AHP.

## FE-15C — UI Deduplication and Real Dataset Sample Integration

### Files Inspected

- `datasets/processed/reviews_final.csv`
- `datasets/processed/reviews_with_aspect_labels_refined.csv`
- `datasets/processed/svm/svm_aspect_dataset.csv`
- `datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_test_predictions.csv`
- `datasets/outputs/eda/04_svm/svm_merged_5class_predictions.csv`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/dataset/page.tsx`
- `frontend/app/scraping/page.tsx`
- `frontend/app/sentiment-analysis/page.tsx`
- `frontend/app/aspect-classification/page.tsx`
- `frontend/app/model-evaluation/page.tsx`
- `frontend/app/reports/page.tsx`
- `frontend/components/tables/ReviewTable.tsx`
- `frontend/components/cards/StatCard.tsx`

### Real Data Files Used

FE-15C menambahkan sampel data real terpusat:

```txt
frontend/lib/research-sample-reviews.ts
```

Data yang digunakan:

- `datasets/processed/reviews_with_aspect_labels_refined.csv` untuk 10 sampel review riset dan 10 sampel aspek weak-label.
- `datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_test_predictions.csv` untuk 10 sampel prediksi sentimen IndoBERT.

Sampel hanya memuat baris kecil untuk UI. `external_id` asli tidak diekspos di frontend.

### Remaining Mock / Fallback Areas

- Halaman AHP/Fuzzy AHP tetap mempertahankan `Mode Mock/Fallback` ketika backend offline.
- Dashboard dan Reports masih menampilkan preview AHP/Fuzzy AHP sample development/mock fallback karena final expert judgement belum tersedia.
- Form prediksi sentimen tetap non-interaktif; sampel yang ditampilkan berasal dari artefak evaluasi, bukan inference API runtime.

### Mock / Fallback Removed

- `/dataset` tidak lagi memakai `mockReviews`; tabel review memakai `researchSampleReviews`.
- `/dashboard` tidak lagi memakai `mockReviews` untuk tabel ulasan negatif; tabel memakai sampel real riset.
- `/scraping` tidak lagi memakai `mockReviews` untuk preview review; tabel memakai sampel real riset.
- `/sentiment-analysis` tidak lagi memakai `mockSentimentResults`; tabel memakai sampel prediksi IndoBERT dari artefak evaluasi.
- `/aspect-classification` tidak lagi memakai `mockAspectResults`; tabel memakai sampel aspek weak-label dari artefak riset.

### UI Duplication Removed

- `/dataset`: kartu `Review Mentah` dan `Duplikasi` dihapus dari KPI atas karena nilainya sudah tersedia pada ringkasan dan tabel kualitas data.
- `/sentiment-analysis`: kartu Positif/Netral/Negatif dihapus karena distribusi sudah ditampilkan melalui chart.
- `/aspect-classification`: kartu `Kriteria` dan `Sampel Aspek` dihapus karena nilainya sudah jelas pada chart/tabel.
- `/model-evaluation`: kartu metrik detail berulang dihapus. Halaman kini memakai 4 KPI utama, chart perbandingan metrik, tabel detail, dan confusion matrix full-width.
- `/reports`: KPI dikurangi agar halaman berfungsi sebagai ringkasan, bukan duplikasi dashboard.
- `/scraping`: package/region dipindahkan dari kartu KPI ke ringkasan agar `com.spotify.music` tidak menjadi nilai besar yang overflow.

### Tables Converted to One-Row / Full-Width Layout

- `/dataset`: tabel kualitas data, rating, label before/after, text length before/after, aspect by sentiment, General fallback/candidate terms, artifact references, dan review samples dibuat full-width per section.
- `/scraping`: tabel parameter scraping, quota, dan sample review dibuat sebagai section terpisah.
- `/model-evaluation`: IndoBERT confusion matrix dan SVM confusion matrix dipisah menjadi card full-width vertikal.
- `/reports`: tabel `Metrik Kunci` dipisah dari summary card agar tidak berdampingan dengan content lain.

### Charts Prioritized

- Dataset page tetap memprioritaskan chart untuk distribusi rating, sentimen, temporal, rating per bulan, panjang teks, dan aspek.
- Model Evaluation page menambahkan chart perbandingan metrik model untuk Accuracy, Precision, Recall, dan Macro F1.
- Tabel dipertahankan untuk data yang membutuhkan angka presisi atau banyak kolom, seperti confusion matrix, data quality audit, artifact references, dan sample reviews.

### Metrics Unavailable / TBD

- Final expert judgement AHP/Fuzzy AHP belum tersedia.
- Real API inference untuk sentiment/aspect belum digunakan dari halaman frontend.
- Full raw dataset tidak dimuat langsung ke frontend.
- PNG figures tetap hanya menjadi artefak referensi; tidak digunakan untuk inferensi angka.

### Risks and Limitations

- Sampel review adalah subset kecil yang dipilih untuk demonstrasi UI dan tidak mewakili distribusi penuh.
- Sampel aspek berasal dari weak-label refinement, bukan ground truth expert.
- Beberapa teks review real dapat mengandung gaya bahasa pengguna asli; FE-15C memilih sampel yang lebih aman untuk presentasi dan tidak mengekspos identifier asli.
- Data masih statis di frontend dan belum dimigrasikan ke service/API runtime.

## FE-15D — Random Research Review Samples Integration

### Files Inspected

- `ml-service/app/main.py`
- `ml-service/app/routers/*`
- `ml-service/app/services/*`
- `ml-service/app/schemas/*`
- `datasets/processed/reviews_with_aspect_labels_refined.csv`
- `frontend/lib/api-endpoints.ts`
- `frontend/services/review-service.ts`
- `frontend/types/api.ts`
- `frontend/lib/research-sample-reviews.ts`
- `frontend/app/dataset/page.tsx`
- `frontend/app/scraping/page.tsx`
- `frontend/app/sentiment-analysis/page.tsx`
- `frontend/app/aspect-classification/page.tsx`

### Real Dataset Source Used

FE-15D memakai dataset processed berikut sebagai sumber backend random samples:

```txt
datasets/processed/reviews_with_aspect_labels_refined.csv
```

File ini dipilih karena memuat teks ulasan, rating, sentimen final, aspek refined, tanggal review, sumber, confidence aspek, dan keyword evidence. `external_id` asli tidak dikembalikan ke frontend; backend membuat ID aman berbasis hash.

### Backend Endpoint Created

Endpoint minimal yang dibuat:

```txt
GET /reviews/random?limit=10
GET /reviews/random?limit=10&with_aspect=true
GET /reviews/random?limit=10&sentiment=negative
GET /reviews/random?limit=10&aspect=Ads
```

Response envelope mengikuti gaya SentiRank:

```json
{
  "success": true,
  "message": "Random research review samples loaded.",
  "data": {
    "items": [],
    "source": "datasets/processed/reviews_with_aspect_labels_refined.csv",
    "limit": 10,
    "count": 10
  }
}
```

### Frontend Pages Updated

- `/dataset`: section `Sampel Ulasan Riset`
- `/scraping`: section `Pratinjau Sampel Ulasan Riset`
- `/sentiment-analysis`: section `Tabel Sampel Prediksi Sentimen Riset`
- `/aspect-classification`: section `Tabel Sampel Aspek Riset`

Setiap section memakai tombol `Refresh Sampel`, metadata sumber data, jumlah sampel, status backend/fallback, dan tabel full-width satu row per section.

### Fields Mapped

- `id`: hash aman dari identifier/source row, bukan `external_id` asli.
- `reviewText`: `content`, fallback ke `text_indobert` atau `text_svm`.
- `rating`: nilai rating jika tersedia.
- `sentiment`: `final_sentiment`, fallback ke `initial_sentiment`.
- `aspect`: `aspect_label` refined jika tersedia.
- `reviewedAt`: `reviewed_at`.
- `source`: `source`, fallback ke `app_id` atau path dataset.
- `aspectConfidence`: `aspect_label_confidence`.
- `keywords`: `aspect_keywords_matched` dipisahkan per token.

### Fallback Behavior

Jika backend offline, base URL belum dikonfigurasi, endpoint gagal, atau request validasi gagal, frontend menampilkan pesan:

```txt
Backend API belum aktif. Jalankan ml-service terlebih dahulu.
```

Tabel tetap terlihat dengan fallback dari:

```txt
frontend/lib/research-sample-reviews.ts
```

Fallback ini berisi sampel riset nyata kecil dari FE-15C, bukan mock FE-07, dan diberi label sebagai fallback lokal.

### Remaining Limitations

- Endpoint ini hanya endpoint demo terbatas untuk sampel random, bukan API dataset penuh.
- Sampel acak tidak menjamin distribusi kelas yang seimbang pada setiap refresh.
- Browser tetap membutuhkan `NEXT_PUBLIC_API_BASE_URL` yang mengarah ke ml-service.
- FE-15D tidak mengganti FE-13 AHP/Fuzzy AHP API demo, tidak menjalankan training, dan tidak mengubah kalkulasi backend.

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
