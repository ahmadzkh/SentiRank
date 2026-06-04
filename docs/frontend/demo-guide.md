# FE-14 Demo Guide - SentiRank Frontend

## Purpose

Dokumen ini menjadi panduan supervisor demo untuk frontend SentiRank. Fokus demo adalah menunjukkan alur analitik penelitian berbasis Light Mode, mock-first pages, dan integrasi sample/development API pada halaman AHP/Fuzzy AHP.

Demo tidak menampilkan hasil final skripsi. Data mock, sample development judgement, dan response backend sample hanya digunakan untuk validasi UI serta alur presentasi.

## How To Run ml-service Backend

Jalankan backend hanya jika ingin mendemokan integrasi API AHP/Fuzzy AHP.

```powershell
cd ml-service
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Endpoint yang dipakai frontend pada FE-13/FE-14:

```txt
GET  /ahp/criteria
POST /ahp/calculate
POST /ahp/fuzzy-calculate
POST /ahp/compare
```

Backend AHP/Fuzzy AHP tetap melakukan perhitungan. Frontend hanya mengirim payload sample development dan menampilkan response.

## How To Run Frontend

Jalankan dari folder `frontend/`.

```powershell
cd frontend
npm run dev
```

Buka:

```txt
http://localhost:3000
```

Untuk validasi sebelum demo:

```powershell
npm run lint
npm run build
```

## Required .env.local

Buat `frontend/.env.local` jika belum ada.

```txt
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Gunakan `127.0.0.1` untuk menghindari mismatch host lokal saat browser memanggil backend. Jika backend berjalan di host/port lain, sesuaikan nilai ini sebelum menjalankan frontend.

## Demo Route Order

Urutan demo yang direkomendasikan:

1. `/` - Landing page SentiRank.
2. `/dashboard` - Ringkasan utama demo skripsi.
3. `/dataset` - Kualitas dan distribusi dataset.
4. `/scraping` - Status pengumpulan data mock.
5. `/preprocessing` - Pipeline pembersihan teks.
6. `/sentiment-analysis` - Preview hasil IndoBERT.
7. `/aspect-classification` - Preview hasil SVM.
8. `/ahp-fuzzy-ahp` - Demo API AHP/Fuzzy AHP dan fallback mock.
9. `/model-evaluation` - Ringkasan evaluasi model.
10. `/reports` - Narasi laporan dan rekomendasi.
11. `/settings` - Metadata aplikasi, model, tema, dan placeholder API.

## AHP/Fuzzy AHP Demo Explanation

Pada halaman `/ahp-fuzzy-ahp`, klik tombol:

```txt
Jalankan Demo API AHP/Fuzzy AHP
```

Alur UI:

1. Frontend memeriksa backend dengan memuat kriteria dari `/ahp/criteria`.
2. Frontend membangun payload sample development.
3. Backend menghitung AHP melalui `/ahp/calculate`.
4. Backend menghitung Fuzzy AHP melalui `/ahp/fuzzy-calculate`.
5. Backend membandingkan ranking melalui `/ahp/compare`.
6. UI menampilkan "Hasil Backend Sample" jika request berhasil.
7. UI menampilkan "Mode Mock/Fallback" jika backend offline atau terjadi error.

Label wajib yang harus terlihat pada demo:

```txt
sample_development_only
not_final_expert_judgement
not_final_skripsi_result
```

Warning wajib:

```txt
Hasil ini menggunakan sample development judgement, belum merupakan hasil final expert judgement, dan bukan hasil final skripsi.
```

## Sample Development Judgement Notes

Sample development judgement bukan final expert judgement. Nilai AHP/Fuzzy AHP yang tampil pada demo tidak boleh dipakai sebagai kesimpulan akhir skripsi.

Tujuan sample development:

- Memvalidasi routing frontend dan backend.
- Menunjukkan format matriks, bobot, Consistency Ratio, dan ranking.
- Menyiapkan alur presentasi sebelum expert judgement final tersedia.
- Menjaga mock fallback tetap demo-visible saat backend tidak aktif.

## Troubleshooting Backend Offline/API Error

Jika halaman menampilkan:

```txt
Backend API belum aktif. Jalankan ml-service terlebih dahulu.
```

Periksa langkah berikut:

1. Pastikan backend berjalan di `http://127.0.0.1:8000`.
2. Pastikan `frontend/.env.local` berisi `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`.
3. Restart frontend setelah mengubah `.env.local`.
4. Buka `http://127.0.0.1:8000/docs` untuk memastikan FastAPI aktif.
5. Pastikan endpoint `/ahp/criteria` tersedia.
6. Jika muncul 404, periksa base URL dan pastikan frontend tidak memanggil `/api/ahp/...`.
7. Jika browser menolak request karena CORS, gunakan mock fallback untuk demo dan catat bahwa konfigurasi CORS backend berada di luar scope FE-14.
8. Jika validasi backend gagal, baca pesan error di panel UI dan pastikan payload sample development masih memakai lima kriteria sample.

## FE-14 Acceptance Criteria

- [x] Landing page, dashboard, core pages, AHP/Fuzzy AHP, reports, dan settings diaudit untuk kesiapan demo.
- [x] UI copy utama menggunakan Bahasa Indonesia dengan method names tetap IndoBERT, SVM, AHP, Fuzzy AHP, API, TFN, dan Consistency Ratio.
- [x] Layout tetap mengikuti SentiRank Research Analytics Light.
- [x] Sidebar, topbar, dan mobile navigation tetap konsisten.
- [x] Halaman AHP/Fuzzy AHP memiliki label `sample_development_only`, `not_final_expert_judgement`, dan `not_final_skripsi_result`.
- [x] Backend offline message jelas dan mock fallback tetap tersedia.
- [x] API success mode dan mock fallback mode tidak menampilkan output duplikatif.
- [x] Consistency Ratio ditampilkan dengan persen dua desimal dan raw CR.
- [x] Demo guide ini tersedia sebagai panduan supervisor demo.
