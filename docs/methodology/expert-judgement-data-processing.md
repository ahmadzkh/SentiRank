# MS-17A — Expert Judgement Data Processing

## Tujuan

Membaca spreadsheet augmented Google Form → memprofil responden → memetakan 10 pairwise comparisons → menghitung AHP Consistency Ratio → menghasilkan output CSV/JSON siap untuk agregasi AHP/Fuzzy AHP (MS-17B).

---

## Spreadsheet Source

| Item | Detail |
|------|--------|
| **File** | `datasets/external/expert_judgement/spotify_expert_judgement_augmented.xlsx` |
| **Format** | Google Form responses + 6 sheets |
| **Sheets digunakan** | `Form Responses 2`, `Pairwise_Values`, `AHP_Validation` |

### Criteria Mapping

| Kode | Nama Kriteria |
|------|--------------|
| C1 | Features, Content & Audio Experience |
| C2 | Ads Experience |
| C3 | Subscription & Pricing |
| C4 | Account/Login |
| C5 | App Reliability & Usability |

> **Perubahan**: Urutan FINAL_CRITERIA di `services/decision-service/app/routers/ahp.py` telah diselaraskan dengan urutan spreadsheet.

### Pairwise Questions (P01–P10)

| ID | Perbandingan |
|----|-------------|
| P01 | C1 vs C2 — Features, Content & Audio Experience vs Ads Experience |
| P02 | C1 vs C3 — Features, Content & Audio Experience vs Subscription & Pricing |
| P03 | C1 vs C4 — Features, Content & Audio Experience vs Account/Login |
| P04 | C1 vs C5 — Features, Content & Audio Experience vs App Reliability & Usability |
| P05 | C2 vs C3 — Ads Experience vs Subscription & Pricing |
| P06 | C2 vs C4 — Ads Experience vs Account/Login |
| P07 | C2 vs C5 — Ads Experience vs App Reliability & Usability |
| P08 | C3 vs C4 — Subscription & Pricing vs Account/Login |
| P09 | C3 vs C5 — Subscription & Pricing vs App Reliability & Usability |
| P10 | C4 vs C5 — Account/Login vs App Reliability & Usability |

---

## Pipeline Script

| Item | Detail |
|------|--------|
| **Script** | `scripts/prepare_expert_judgement_dataset.py` |
| **Input** | Spreadsheet augmented |
| **Output** | `datasets/processed/expert_judgement/` |
| **Dependencies** | Python 3.11+, openpyxl |

### Alur

1. **Baca Pairwise_Values** — primary source untuk nilai numerik pairwise (10 kolom numeric P01–P10).
2. **Cross-check** dengan teks jawaban dari Form Responses 2 — verifikasi konsistensi parsing.
3. **Baca AHP_Validation** — ambil CR dan status yang sudah dihitung untuk verifikasi.
4. **Baca Form Responses 2** — ekstrak profil responden (anonimasi nama & email).
5. **Hitung ulang CR** — geometric mean weights + Saaty's RI.
6. **Validasi** — CR ≤ 0.10 = valid.
7. **Output 5 file**.

---

## Responden

| ID | Kode Asli | Tipe | CR | Status | Kriteria Teratas |
|----|-----------|------|-----|--------|-----------------|
| EJ001 | ACT-01 | **actual** | 0.5145 | ❌ INVALID | C4 — Account/Login |
| EJ002 | SYN-01 | synthetic | 0.0426 | ✅ VALID | C5 — App Reliability & Usability |
| EJ003 | SYN-02 | synthetic | 0.0331 | ✅ VALID | C5 — App Reliability & Usability |
| EJ004 | SYN-03 | synthetic | 0.0437 | ✅ VALID | C1 — Features, Content & Audio |
| EJ005 | SYN-04 | synthetic | 0.0331 | ✅ VALID | C5 — App Reliability & Usability |
| EJ006 | SYN-05 | synthetic | 0.0437 | ✅ VALID | C1 — Features, Content & Audio |
| EJ007 | SYN-06 | synthetic | 0.0437 | ✅ VALID | C4 — Account/Login |
| EJ008 | SYN-07 | synthetic | 0.0437 | ✅ VALID | C5 — App Reliability & Usability |
| EJ009 | SYN-08 | synthetic | 0.0402 | ✅ VALID | C2 — Ads Experience |
| EJ010 | SYN-09 | synthetic | 2.0901 | ❌ INVALID | C1 — Features, Content & Audio |

### Ringkasan

| Kategori | Jumlah |
|----------|--------|
| Total responden | 10 |
| Actual | 1 |
| Synthetic | 9 |
| Valid (CR ≤ 0.10) | **8** |
| Invalid (CR > 0.10) | **2** |

### Data Aktual — Catatan

Satu-satunya responden actual (EJ001 / ACT-01 / Dhian Sweetania) memiliki CR = 0.5145, jauh di atas threshold 0.10. Jawaban beliau **tidak lolos** uji konsistensi AHP. Ini mencerminkan pendapat asli responden dan tidak perlu direvisi. Untuk agregasi AHP/Fuzzy AHP final (MS-17B), perlu dikumpulkan responden actual tambahan.

### Data Sintetis — Peringatan

9 responden synthetic (SYN-01 s.d. SYN-09) dibuat untuk **verifikasi pipeline** saja. Jangan dilaporkan sebagai expert judgement nyata di skripsi atau publikasi.

---

## Output Files

| File | Isi |
|------|-----|
| `expert_judgement_responses.csv` | Semua responden — profil + CR + bobot AHP |
| `expert_judgement_valid_responses.csv` | Hanya responden valid (CR ≤ 0.10) — 8 rows |
| `expert_judgement_pairwise_matrices.json` | Matriks 5×5 per responden + bobot AHP |
| `expert_judgement_validation_summary.json` | CR, lambda_max, CI, status per responden |
| `expert_judgement_mapping_summary.json` | Ringkasan mapping, statistik, next step |

### Anonimasi

- Email dihapus dari semua output processed.
- Nama asli diganti dengan `respondent_id` (EJ001, EJ002, ...).
- Profile fields terpilih tetap dipertahankan (role, expertise, pendidikan, dll).

---

## Perubahan yang Dilakukan

| File | Perubahan |
|------|-----------|
| `services/decision-service/app/routers/ahp.py` | FINAL_CRITERIA diurutkan sesuai spreadsheet (C2=Ads, C3=Pricing, C4=Account, C5=Reliability) |
| `scripts/prepare_expert_judgement_dataset.py` | **BARU** — intake + mapping + validation pipeline |
| `datasets/external/expert_judgement/spotify_expert_judgement_augmented.xlsx` | **BARU** — copy spreadsheet augmented |
| `datasets/processed/expert_judgement/*` | **BARU** — 5 file output |
| `docs/methodology/expert-judgement-data-processing.md` | **BARU** — dokumentasi ini |

---

## Next Step

### MS-17B — AHP and Fuzzy AHP Aggregation & Ranking

- Baca `datasets/processed/expert_judgement/expert_judgement_valid_responses.csv`
- Geometric mean aggregation dari responden valid
- Kirim ke `POST /ahp/calculate` dan `POST /ahp/fuzzy-calculate`
- Dapatkan ranking final AHP + Fuzzy AHP
- Update dashboard dan model-evaluation di frontend
