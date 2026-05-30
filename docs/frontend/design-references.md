# Design References — SentiRank Frontend

## Document Information

| Field | Description |
| --- | --- |
| Project | SentiRank |
| Module | Frontend UI/UX |
| Phase | FE-01 — Design References |
| Default Theme | Light Mode |
| Design Direction | SentiRank Research Analytics Light |
| Status | Draft |
| Purpose | Menentukan referensi desain, batasan visual, dan arah UI/UX awal untuk pengembangan frontend SentiRank. |

---

## 1. Context

SentiRank adalah aplikasi web untuk analisis sentimen ulasan Spotify dan prioritas insight berbasis metode AHP/Fuzzy AHP. Sistem ini dirancang untuk membantu proses analisis ulasan pengguna, klasifikasi aspek, evaluasi model, serta penyusunan ranking prioritas aspek negatif yang perlu diperhatikan.

Frontend SentiRank harus mendukung kebutuhan penelitian, demonstrasi sistem, dan penyajian hasil analitik secara jelas. Oleh karena itu, desain antarmuka tidak boleh hanya berorientasi pada estetika visual, tetapi harus mendukung keterbacaan data, alur analisis, dan interpretasi hasil.

---

## 2. Design Boundary

Keputusan awal desain:

```txt
SentiRank bukan landing page.
SentiRank bukan e-commerce.
SentiRank bukan aplikasi fashion/editorial.
SentiRank bukan aplikasi media sosial.
SentiRank bukan dashboard cyberpunk atau visual eksperimen.
SentiRank adalah research analytics dashboard.
```

Implikasi dari batasan tersebut:

- UI harus mengutamakan data, tabel, grafik, dan interpretasi hasil.
- Visual harus terlihat profesional, bersih, dan akademik.
- Elemen dekoratif harus dibatasi.
- Desain harus cocok untuk screenshot laporan skripsi dan presentasi.
- Arah desain harus mendukung workflow analisis, bukan promosi produk.

---

## 3. Main Design Direction

### Selected Direction

```txt
SentiRank Research Analytics Light
```

### Description

SentiRank menggunakan gaya visual dashboard analitik berbasis Light Mode yang bersih, profesional, dan data-driven. Tampilan harus terasa seperti aplikasi SaaS analytics atau research dashboard, bukan seperti landing page marketing.

### Design Keywords

```txt
clean
academic
professional
analytical
light-mode
SaaS dashboard
data-driven
readable
elegant
research-oriented
decision-support
```

### Visual Tone

SentiRank harus terlihat:

- Serius, tetapi tidak kaku.
- Modern, tetapi tidak terlalu eksperimental.
- Elegan, tetapi tidak dekoratif berlebihan.
- Teknis, tetapi tetap mudah dipahami oleh dosen/penguji.
- Data-driven, tetapi tidak terlalu padat seperti monitoring dashboard enterprise.

---

## 4. Default Theme

### Theme Decision

Default theme yang digunakan adalah:

```txt
Light Mode
```

### Reason

Light Mode dipilih karena:

1. Lebih mudah dibaca untuk laporan akademik.
2. Lebih cocok untuk screenshot Bab 4 skripsi.
3. Lebih aman untuk presentasi ke dosen/penguji.
4. Memudahkan pembacaan tabel, grafik, dan matriks AHP/Fuzzy AHP.
5. Lebih netral untuk aplikasi analitik dan decision-support.

### Visual Base

| Element          | Direction             |
| ---------------- | --------------------- |
| Background       | Soft gray / off-white |
| Surface          | White card            |
| Text utama       | Navy / slate dark     |
| Text sekunder    | Slate gray            |
| Accent           | Blue                  |
| Success          | Green                 |
| Warning          | Amber                 |
| Error / Negative | Red                   |
| Border           | Light gray            |
| Shadow           | Subtle, soft, minimal |

---

## 5. Design Reference Evaluation Criteria

Referensi desain dievaluasi berdasarkan kriteria berikut:

| Criteria | Description |
| --- | --- |
| Relevance | Apakah cocok dengan aplikasi analitik penelitian? |
| Readability | Apakah teks, tabel, dan data mudah dibaca? |
| Dashboard Suitability | Apakah cocok untuk card, chart, metric, dan table? |
| Implementation Feasibility | Apakah realistis diimplementasikan dengan NextJS, Tailwind, dan shadcn/ui? |
| Academic Fit | Apakah cocok untuk skripsi dan demonstrasi sistem? |
| Visual Consistency | Apakah mudah dijadikan design system? |
| Scalability | Apakah dapat diperluas ke banyak halaman? |

---

## 6. Selected Design References

Referensi utama yang digunakan:

```txt
1. Linear
2. Vercel
3. Stripe-style SaaS Analytics Dashboard
4. Metabase
5. Grafana
```

Referensi pendukung:

```txt
6. Notion
7. Supabase
8. Google Cloud Console
9. GitHub Insights
10. Plausible Analytics
```

Referensi yang tidak dipilih sebagai basis utama:

```txt
Nike
Apple product landing page
Cyberpunk dashboard
Heavy glassmorphism UI
Dark-only monitoring dashboard
Fashion/editorial layout
```

---

# 7. Primary References

---

## 7.1 Reference 1 — Linear

### Category

```txt
Productivity / Developer Product / SaaS Interface
```

### Why It Is Relevant

Linear relevan karena memiliki tampilan yang bersih, presisi, dan modern. Antarmukanya menonjolkan struktur informasi yang rapi, spacing yang konsisten, serta nuansa technical-product yang cocok untuk aplikasi berbasis data dan analisis.

Untuk SentiRank, Linear cocok sebagai referensi untuk menciptakan kesan modern, terstruktur, dan profesional tanpa visual berlebihan.

### What to Adapt

Elemen yang dapat diadaptasi:

- Clean layout.
- Typography hierarchy yang tegas.
- Sidebar navigation yang rapi.
- Card dan panel yang minimal.
- Spacing yang konsisten.
- Tampilan technical tetapi tetap elegan.
- Fokus pada workflow dan produktivitas.

### What to Avoid

Elemen yang tidak perlu diadaptasi:

- Dark theme sebagai identitas utama.
- Nuansa startup/productivity yang terlalu dominan.
- Animasi atau visual polish yang tidak relevan dengan dashboard skripsi.
- Layout yang terlalu abstrak untuk kebutuhan data table dan chart.

### Application to SentiRank

Linear dapat menjadi referensi untuk:

- Sidebar utama.
- Topbar.
- Page header.
- Empty state.
- Layout halaman yang bersih.
- Struktur navigasi antar modul.

Contoh penerapan:

```txt
Dashboard
Dataset
Sentiment Analysis
Aspect Classification
AHP / Fuzzy AHP
Model Evaluation
Reports
```

Setiap halaman menggunakan struktur yang konsisten: page title, deskripsi singkat, summary cards, content cards, table/chart section, dan action area.

---

## 7.2 Reference 2 — Vercel

### Category

```txt
Developer Platform / Technical Product / Minimal UI
```

### Why It Is Relevant

Vercel relevan karena memiliki gaya visual minimal, tajam, dan profesional. Tampilan Vercel kuat dalam penggunaan whitespace, kontras, typography, dan technical credibility.

Untuk SentiRank, referensi ini berguna untuk menjaga UI tetap bersih, modern, dan tidak terlalu ramai.

### What to Adapt

Elemen yang dapat diadaptasi:

- Minimal technical aesthetic.
- Strong typography.
- Clear page hierarchy.
- White/neutral background.
- Navigation sederhana.
- Komponen yang terasa premium tetapi tidak berlebihan.
- Penggunaan border dan subtle shadow.

### What to Avoid

Elemen yang tidak perlu diadaptasi:

- Kontras hitam-putih yang terlalu ekstrem.
- Landing-page marketing style.
- Hero section besar yang tidak relevan dengan dashboard.
- Visual branding yang terlalu developer-platform oriented.

### Application to SentiRank

Vercel dapat menjadi referensi untuk:

- Page header.
- Button style.
- Layout dokumentasi/report.
- Clean card container.
- Developer/research tone pada interface.

Contoh penerapan:

```txt
Halaman Model Evaluation menggunakan gaya bersih:
- title jelas
- metric cards
- confusion matrix card
- classification report table
- model comparison section
```

---

## 7.3 Reference 3 — Stripe-style SaaS Analytics Dashboard

### Category

```txt
SaaS Dashboard / Analytics / Business Metrics
```

### Why It Is Relevant

Stripe-style dashboard relevan karena memiliki struktur metric-driven yang kuat. Dashboard seperti ini biasanya menampilkan summary card, trend chart, table, filter, dan action button dengan visual yang profesional.

Untuk SentiRank, pola ini sangat cocok karena aplikasi perlu menampilkan total review, distribusi sentimen, performa model, ranking aspek, dan ringkasan rekomendasi.

### What to Adapt

Elemen yang dapat diadaptasi:

- Metric summary cards.
- Polished dashboard layout.
- Clear data hierarchy.
- Filter dan date range control.
- Table yang readable.
- Chart dengan visual minimal.
- Card grouping berdasarkan fungsi.

### What to Avoid

Elemen yang tidak perlu diadaptasi:

- Nuansa payment/finance yang terlalu kuat.
- Detail transaksi yang tidak relevan.
- Visual komersial berlebihan.
- Terlalu banyak micro-interaction.

### Application to SentiRank

Stripe-style dashboard dapat menjadi referensi untuk halaman:

- Dashboard.
- Dataset summary.
- Sentiment summary.
- Report page.

Contoh penerapan pada dashboard SentiRank:

```txt
Top summary cards:
- Total Reviews
- Positive Reviews
- Neutral Reviews
- Negative Reviews
- Top Negative Aspect
- Priority Score
```

Kemudian dilanjutkan dengan:

```txt
- Sentiment Distribution Chart
- Aspect Ranking Chart
- Model Performance Summary
- Latest Negative Reviews Table
```

---

## 7.4 Reference 4 — Metabase

### Category

```txt
Business Intelligence / Data Analytics Dashboard
```

### Why It Is Relevant

Metabase relevan karena fokus pada eksplorasi data, dashboard, chart, dan table. SentiRank juga membutuhkan struktur serupa untuk menampilkan dataset review, hasil preprocessing, distribusi sentimen, hasil klasifikasi aspek, serta ranking AHP/Fuzzy AHP.

Metabase cocok sebagai referensi karena orientasinya sangat data-first.

### What to Adapt

Elemen yang dapat diadaptasi:

- Card-based dashboard.
- Chart panel grouping.
- Data table layout.
- Filterable dashboard.
- Visualisasi sederhana dan mudah dibaca.
- Struktur analitik berbasis query/result.

### What to Avoid

Elemen yang tidak perlu diadaptasi:

- Tampilan yang terlalu generic.
- Layout dashboard yang terlalu padat.
- Interface yang terasa terlalu BI-tool dan kurang spesifik untuk penelitian.
- Banyak konfigurasi query yang tidak diperlukan user akhir.

### Application to SentiRank

Metabase dapat menjadi referensi untuk:

- Dataset page.
- Review explorer.
- Sentiment distribution.
- Aspect frequency.
- Report summary.

Contoh penerapan:

```txt
Dataset Page:
- Dataset summary cards
- Rating distribution chart
- Label distribution chart
- Data quality summary
- Review table with filters
```

---

## 7.5 Reference 5 — Grafana

### Category

```txt
Monitoring Dashboard / Data Visualization / Panel-based Analytics
```

### Why It Is Relevant

Grafana relevan karena memiliki struktur panel-based dashboard yang kuat untuk menampilkan banyak metrik dalam satu tampilan. SentiRank dapat mengambil pola dashboard panel dari Grafana, terutama untuk menyusun ringkasan model, distribusi sentimen, dan tren review.

Namun, Grafana tidak cocok diikuti secara penuh karena biasanya lebih padat, teknis, dan sering diasosiasikan dengan dark monitoring dashboard.

### What to Adapt

Elemen yang dapat diadaptasi:

- Panel-based dashboard structure.
- Metric monitoring layout.
- Multi-chart composition.
- Data visualization grouping.
- Quick summary per section.

### What to Avoid

Elemen yang tidak perlu diadaptasi:

- Dark monitoring theme.
- Dashboard terlalu dense.
- Terlalu banyak chart kecil.
- Visual yang terlalu DevOps/infrastructure-oriented.
- Warna yang terlalu kuat untuk alert/monitoring.

### Application to SentiRank

Grafana hanya digunakan sebagai referensi struktur dashboard, bukan visual identity utama.

Contoh penerapan:

```txt
Dashboard panel:
- Review Volume
- Sentiment Distribution
- Negative Aspect Frequency
- AHP Priority Ranking
- Model Performance
```

Setiap panel tetap dibuat lebih ringan, luas, dan readable agar cocok untuk skripsi.

---

# 8. Supporting References

---

## 8.1 Reference 6 — Notion

### Category

```txt
Productivity / Documentation / Content-heavy Interface
```

### Why It Is Relevant

Notion relevan karena memiliki tampilan yang bersih, ringan, dan mudah dibaca. SentiRank membutuhkan beberapa halaman yang bersifat dokumentatif, seperti Reports, Methodology Summary, dan Explanation untuk hasil AHP/Fuzzy AHP.

### What to Adapt

- Readable content layout.
- Simple section hierarchy.
- Minimal visual noise.
- Clean documentation style.
- Comfortable spacing for text-heavy sections.

### What to Avoid

- Tampilan yang terlalu plain.
- Kurangnya emphasis pada data visualization.
- Struktur yang terlalu document-centric untuk dashboard utama.

### Application to SentiRank

Notion cocok untuk:

```txt
Reports Page
Method Summary
Recommendation Explanation
AHP/Fuzzy AHP Interpretation
```

---

## 8.2 Reference 7 — Supabase

### Category

```txt
Developer Dashboard / Database Platform / Admin Interface
```

### Why It Is Relevant

Supabase relevan karena memiliki dashboard developer yang cukup modern, bersih, dan cocok untuk aplikasi teknis. SentiRank juga memiliki nuansa teknis karena melibatkan dataset, backend service, model machine learning, dan API.

### What to Adapt

- Developer-friendly dashboard.
- Clean navigation.
- Table and configuration layout.
- Technical but approachable style.
- Organized sidebar.

### What to Avoid

- Tampilan yang terlalu database/platform-centric.
- Terlalu banyak konfigurasi teknis yang tidak relevan untuk user penelitian.
- Dark theme dominance.

### Application to SentiRank

Supabase dapat menjadi inspirasi untuk:

```txt
Settings Page
API Integration Page
Dataset Management Page
Service Status Section
```

---

## 8.3 Reference 8 — Google Cloud Console

### Category

```txt
Cloud Dashboard / Enterprise Admin UI
```

### Why It Is Relevant

Google Cloud Console relevan sebagai referensi untuk enterprise dashboard, navigasi, card, table, service list, dan struktur admin panel. SentiRank tidak perlu mengikuti kompleksitas Google Cloud, tetapi dapat mengambil pola UI yang rapi dan fungsional.

### What to Adapt

- Clear navigation structure.
- Quick access cards.
- Service/module grouping.
- Table-heavy admin UI.
- Informational cards.

### What to Avoid

- Kompleksitas menu yang terlalu besar.
- UI yang terlalu enterprise.
- Terlalu banyak konfigurasi teknis.
- Visual yang terlalu generic.

### Application to SentiRank

Google Cloud Console dapat menjadi referensi untuk:

```txt
Module navigation
Quick access dashboard
Settings
System status
API preparation page
```

---

## 8.4 Reference 9 — GitHub Insights

### Category

```txt
Repository Analytics / Developer Metrics
```

### Why It Is Relevant

GitHub Insights relevan karena menampilkan data, grafik, aktivitas, dan ringkasan metrik dalam format yang cukup sederhana dan informatif. SentiRank dapat mengambil pola penyajian metric dan trend yang tidak terlalu dekoratif.

### What to Adapt

- Simple analytics section.
- Clean table/chart combination.
- Activity and metric summary.
- Developer-friendly interface.

### What to Avoid

- Tampilan yang terlalu repository-oriented.
- Kurangnya visual polish untuk dashboard utama.
- Layout yang terlalu sederhana jika digunakan penuh.

### Application to SentiRank

GitHub Insights dapat menjadi inspirasi untuk:

```txt
Model evaluation history
Dataset update history
Review processing activity
Report generation log
```

---

## 8.5 Reference 10 — Plausible Analytics

### Category

```txt
Web Analytics / Minimal Dashboard
```

### Why It Is Relevant

Plausible Analytics relevan karena menampilkan dashboard analytics yang sederhana, ringan, dan langsung ke inti data. Hal ini cocok untuk SentiRank yang perlu menampilkan insight tanpa membebani user dengan banyak visual kompleks.

### What to Adapt

- Minimal analytics layout.
- Clear metric cards.
- Simple chart style.
- Lightweight interface.
- Easy-to-read data sections.

### What to Avoid

- Tampilan yang terlalu sederhana untuk kebutuhan AHP/Fuzzy AHP.
- Kurangnya struktur untuk matrix dan model evaluation.
- Terlalu sedikit komponen untuk aplikasi kompleks.

### Application to SentiRank

Plausible dapat menjadi referensi untuk:

```txt
Sentiment summary
Review trend
Aspect frequency
Compact dashboard section
```

---

# 9. Rejected or Limited References

---

## 9.1 Nike

### Category

```txt
Fashion / Sport / Editorial / E-commerce Branding
```

### Why It Is Not Used as Main Reference

Nike memiliki visual yang kuat, bold, editorial, dan brand-heavy. Gaya ini cocok untuk e-commerce, campaign, fashion, sport product, dan landing page. Namun, SentiRank adalah aplikasi research analytics dashboard, sehingga gaya Nike tidak cocok sebagai basis utama.

### What Can Still Be Learned

Elemen yang masih bisa dipelajari:

- Strong visual discipline.
- Typography hierarchy.
- Clean product presentation.
- Confident use of whitespace.

### What to Avoid

- Oversized campaign typography.
- Editorial/fashion composition.
- Product hero section.
- Strong brand imagery.
- E-commerce layout.
- Visual yang terlalu dominan dibanding data.

### Decision

Nike tidak digunakan sebagai basis desain utama. Jika dipakai, hanya sebagai referensi minor untuk whitespace dan typography discipline, bukan layout utama.

---

## 9.2 Cyberpunk Dashboard

### Why It Is Rejected

Cyberpunk dashboard sering menggunakan dark background, neon color, glow effect, dan visual futuristik. Walaupun menarik secara visual, gaya ini tidak cocok untuk skripsi karena dapat mengurangi keterbacaan data dan terlihat terlalu dekoratif.

### Decision

Rejected.

---

## 9.3 Heavy Glassmorphism UI

### Why It Is Rejected

Glassmorphism yang berlebihan dapat mengganggu kontras, readability, dan konsistensi dashboard. Untuk aplikasi yang banyak menampilkan tabel, chart, dan matriks AHP/Fuzzy AHP, efek transparansi berlebihan akan menurunkan kualitas UX.

### Decision

Rejected.

---

## 9.4 Landing Page Marketing Style

### Why It Is Rejected

Landing page biasanya berorientasi pada promosi, hero section, CTA, testimoni, dan visual branding. SentiRank membutuhkan interface operasional untuk analisis, bukan halaman marketing.

### Decision

Rejected.

---

# 10. Final Visual Direction

## Selected Visual Direction

```txt
SentiRank Research Analytics Light
```

## Main Inspiration Mix

```txt
Linear + Vercel + Stripe-style SaaS Analytics + Metabase
```

## Supporting Inspiration

```txt
Grafana for dashboard composition
Notion for report/document readability
Supabase for technical/admin interface
Plausible Analytics for minimal metric presentation
```

## Final Description

SentiRank akan menggunakan desain dashboard analitik modern berbasis Light Mode dengan tampilan bersih, profesional, akademik, dan data-driven. Desain harus mendukung proses analisis sentimen, klasifikasi aspek, evaluasi model, serta interpretasi hasil AHP/Fuzzy AHP.

---

# 11. UI Layout Direction

## Main Application Layout

Struktur layout utama:

```txt
App Shell
├── Sidebar Navigation
├── Topbar / Header
├── Main Content Area
└── Page Content Sections
```

## Sidebar Navigation

Menu utama:

```txt
Dashboard
Dataset
Scraping
Preprocessing
Sentiment Analysis
Aspect Classification
AHP / Fuzzy AHP
Model Evaluation
Reports
Settings
```

## Page Structure

Setiap halaman utama sebaiknya mengikuti pola:

```txt
Page Header
├── Page Title
├── Short Description
└── Optional Action Button

Summary Section
├── Stat Cards
└── Key Metrics

Main Content
├── Chart Card
├── Table Card
├── Form / Input Section
└── Result Section

Supporting Content
├── Explanation
├── Notes
└── Export / Action Area
```

---

# 12. Component Direction

Komponen utama yang akan digunakan:

```txt
AppSidebar
AppTopbar
PageHeader
StatCard
ChartCard
DataTable
ReviewTable
MatrixTable
RankingCard
SentimentBadge
AspectBadge
UploadBox
FilterBar
SearchInput
EmptyState
LoadingState
ErrorState
```

## Component Style Rules

### Cards

- Background putih.
- Border tipis.
- Shadow lembut.
- Rounded corner medium.
- Padding konsisten.
- Header card jelas.

### Tables

- Harus mudah dibaca.
- Gunakan row spacing yang cukup.
- Sediakan filter jika data banyak.
- Hindari tabel terlalu padat.
- Kolom penting harus terlihat jelas.

### Charts

- Gunakan warna minimal.
- Label harus jelas.
- Hindari chart dekoratif.
- Prioritaskan interpretasi.
- Gunakan chart hanya jika membantu pemahaman data.

### Badges

Sentiment badge:

```txt
Positive → Green
Neutral  → Slate/Gray
Negative → Red
```

Aspect badge:

```txt
Performance
UI/UX
Ads
Subscription
Recommendation
Audio Quality
Bug/Error
Account/Login
```

### Buttons

- Primary button memakai blue accent.
- Secondary button memakai neutral border.
- Destructive button hanya untuk aksi berisiko.
- Hindari terlalu banyak button dalam satu section.

---

# 13. Page-specific Design Direction

---

## 13.1 Dashboard Page

### Purpose

Memberikan ringkasan utama kondisi data, hasil analisis sentimen, ranking aspek negatif, performa model, dan preview AHP/Fuzzy AHP.

### Layout

```txt
Dashboard
├── Summary Cards
│   ├── Total Reviews
│   ├── Positive Reviews
│   ├── Neutral Reviews
│   ├── Negative Reviews
│   ├── Top Negative Aspect
│   └── Priority Score
│
├── Main Analytics
│   ├── Sentiment Distribution Chart
│   ├── Negative Aspect Ranking Chart
│   └── AHP/Fuzzy AHP Priority Preview
│
└── Data Preview
    ├── Latest Negative Reviews Table
    └── Model Performance Summary
```

### Reference Influence

- Stripe-style dashboard untuk summary cards.
- Metabase untuk chart/table layout.
- Linear untuk sidebar dan clean layout.

---

## 13.2 Dataset Page

### Purpose

Menampilkan dataset review, ringkasan data, distribusi rating, distribusi label, dan kualitas data.

### Layout

```txt
Dataset Page
├── Dataset Summary Cards
├── Upload / Import Section
├── Data Quality Summary
├── Rating Distribution Chart
├── Label Distribution Chart
└── Review Data Table
```

### Reference Influence

- Metabase untuk data table.
- Supabase untuk data management style.
- Plausible untuk metric simplicity.

---

## 13.3 Scraping Page

### Purpose

Menampilkan proses scraping ulasan, status scraping, jumlah data terkumpul, dan hasil batch scraping.

### Layout

```txt
Scraping Page
├── Scraping Status Card
├── Batch Summary
├── Rating Group Distribution
├── Scraping Result Table
└── Export Raw Dataset Action
```

### Reference Influence

- Google Cloud Console untuk process/status card.
- Supabase untuk technical/admin layout.

---

## 13.4 Preprocessing Page

### Purpose

Menampilkan proses pembersihan teks, normalisasi, tokenization, stopword removal, stemming, dan hasil data processed.

### Layout

```txt
Preprocessing Page
├── Preprocessing Pipeline Overview
├── Before/After Text Preview
├── Processed Dataset Summary
├── Word Frequency / Token Summary
└── Processed Data Table
```

### Reference Influence

- Notion untuk explanation section.
- Metabase untuk table and data preview.

---

## 13.5 Sentiment Analysis Page

### Purpose

Menampilkan hasil analisis sentimen menggunakan model IndoBERT serta distribusi sentimen pada dataset.

### Layout

```txt
Sentiment Analysis Page
├── Single Review Prediction Input
├── Prediction Result Card
├── Batch Sentiment Summary
├── Sentiment Distribution Chart
├── Confidence Score Display
└── Sentiment Result Table
```

### Reference Influence

- Stripe-style SaaS dashboard untuk prediction result card.
- Metabase untuk table/chart.
- Linear untuk clean form layout.

---

## 13.6 Aspect Classification Page

### Purpose

Menampilkan hasil klasifikasi aspek menggunakan SVM classifier internal.

### Layout

```txt
Aspect Classification Page
├── Aspect Summary Cards
├── Aspect Frequency Chart
├── Negative Review Grouping
├── Aspect Classification Table
└── Aspect Detail Section
```

### Reference Influence

- Metabase untuk chart/table grouping.
- Plausible untuk compact analytics.
- Linear untuk hierarchy.

---

## 13.7 AHP / Fuzzy AHP Page

### Purpose

Menampilkan proses dan hasil pembobotan aspek negatif menggunakan AHP dan Fuzzy AHP.

### Layout

```txt
AHP / Fuzzy AHP Page
├── Criteria Setup
├── Expert Judgement Input
├── Pairwise Comparison Matrix
├── Consistency Ratio Card
├── AHP Weight Result
├── Fuzzy AHP Weight Result
├── Ranking Comparison Chart
└── Final Recommendation Summary
```

### Design Requirements

- Matrix harus readable.
- Ranking harus jelas.
- Consistency Ratio harus mudah dipahami.
- Hasil Fuzzy AHP harus dijelaskan, bukan hanya angka.
- Gunakan visual hierarchy agar user memahami proses dari input → perhitungan → ranking → rekomendasi.

### Reference Influence

- Metabase untuk data layout.
- Notion untuk explanation/interpretation.
- Stripe-style dashboard untuk result cards.
- Grafana hanya untuk multi-panel result composition.

---

## 13.8 Model Evaluation Page

### Purpose

Menampilkan performa model sentiment analysis dan aspect classification.

### Layout

```txt
Model Evaluation Page
├── Model Summary Cards
├── Accuracy / Precision / Recall / F1 Score
├── Confusion Matrix
├── Classification Report Table
├── Model Comparison
└── Evaluation Notes
```

### Reference Influence

- Vercel untuk technical clarity.
- Metabase untuk table/chart.
- Stripe-style dashboard untuk metric summary.

---

## 13.9 Reports Page

### Purpose

Menyediakan ringkasan hasil penelitian dan opsi export laporan.

### Layout

```txt
Reports Page
├── Report Summary
├── Sentiment Analysis Summary
├── Aspect Classification Summary
├── AHP/Fuzzy AHP Recommendation Summary
├── Export PDF
├── Export Excel
└── Research Notes
```

### Reference Influence

- Notion untuk readability.
- Vercel untuk clean report layout.
- Stripe-style dashboard untuk summary cards.

---

## 13.10 Settings Page

### Purpose

Mengatur konfigurasi sistem, endpoint API, model setting, dan metadata aplikasi.

### Layout

```txt
Settings Page
├── Application Settings
├── API Configuration
├── Model Configuration
├── Theme Preference
└── System Information
```

### Reference Influence

- Supabase untuk technical configuration.
- Google Cloud Console untuk service setting.
- Linear untuk clean setting layout.

---

# 14. Visual Rules

## 14.1 Color Rules

SentiRank menggunakan warna netral dan aksen biru.

| Purpose        | Suggested Color      |
| -------------- | -------------------- |
| Primary Text   | Navy / Slate 900     |
| Secondary Text | Slate 600            |
| Muted Text     | Slate 500            |
| Background     | Slate 50 / Off-white |
| Surface        | White                |
| Border         | Slate 200            |
| Primary Accent | Blue 600             |
| Positive       | Green 600            |
| Neutral        | Slate 500            |
| Negative       | Red 600              |
| Warning        | Amber 600            |

### Rules

- Biru digunakan untuk aksi utama dan highlight.
- Merah hanya digunakan untuk negative sentiment/error.
- Hijau hanya digunakan untuk positive/success.
- Amber digunakan untuk warning atau consistency warning.
- Jangan gunakan terlalu banyak warna dalam satu halaman.
- Chart harus konsisten dengan makna warna.

---

## 14.2 Typography Rules

### Direction

Gunakan typography yang bersih dan mudah dibaca.

Suggested font:

```txt
Inter
```

Fallback:

```txt
Geist
System UI
Arial
sans-serif
```

### Rules

- Heading harus tegas tetapi tidak terlalu besar.
- Body text harus nyaman dibaca.
- Label tabel harus jelas.
- Angka metric harus lebih menonjol.
- Jangan gunakan font dekoratif.

---

## 14.3 Spacing Rules

### Direction

Gunakan spacing konsisten dan cukup longgar.

### Rules

- Gunakan grid layout.
- Jangan membuat card terlalu rapat.
- Beri jarak yang cukup antara section.
- Tabel tidak boleh terasa sesak.
- Dashboard harus readable pada layar laptop.

---

## 14.4 Border and Shadow Rules

### Direction

Gunakan border tipis dan shadow lembut.

### Rules

- Card menggunakan border light gray.
- Shadow hanya untuk depth ringan.
- Hindari shadow tebal.
- Hindari glow effect.
- Rounded corner medium.

---

## 14.5 Chart Rules

### Direction

Chart harus membantu interpretasi, bukan sekadar dekorasi.

### Rules

- Gunakan chart hanya jika relevan.
- Label harus jelas.
- Jangan gunakan warna terlalu banyak.
- Jangan gunakan 3D chart.
- Hindari chart yang terlalu padat.
- Sertakan summary atau insight singkat di dekat chart.

---

## 14.6 Table Rules

### Direction

Tabel adalah komponen penting karena SentiRank banyak bekerja dengan review text.

### Rules

- Tabel harus filterable.
- Tabel harus searchable jika datanya banyak.
- Gunakan pagination.
- Kolom text review harus dapat dipotong dengan expand/detail.
- Gunakan badge untuk sentiment dan aspect.
- Hindari menampilkan terlalu banyak kolom sekaligus.

---

# 15. Accessibility Rules

SentiRank harus tetap readable dan accessible.

Rules:

- Pastikan kontras teks cukup kuat.
- Jangan hanya menggunakan warna untuk menyampaikan status.
- Gunakan label pada form.
- Gunakan heading hierarchy yang benar.
- Gunakan ukuran font yang nyaman.
- Pastikan tabel tetap terbaca pada layar laptop.
- Pastikan button memiliki state hover/focus.
- Hindari animasi berlebihan.
- Hindari warna merah/hijau tanpa label teks.

---

# 16. Do and Don’t

## Do

- Gunakan Light Mode sebagai default.
- Gunakan layout dashboard dengan sidebar.
- Gunakan card untuk metric summary.
- Gunakan chart sederhana dan readable.
- Gunakan table yang rapi.
- Gunakan blue accent secara konsisten.
- Gunakan badge untuk sentiment/aspect.
- Sertakan interpretasi pada hasil AHP/Fuzzy AHP.
- Buat UI cocok untuk screenshot laporan skripsi.
- Pertahankan desain profesional dan akademik.

## Don’t

- Jangan membuat UI seperti landing page.
- Jangan meniru Nike/editorial style sebagai basis utama.
- Jangan menggunakan neon/cyberpunk.
- Jangan menggunakan glassmorphism berlebihan.
- Jangan membuat dark mode sebagai default.
- Jangan menaruh terlalu banyak chart dalam satu layar.
- Jangan hardcode jumlah kriteria AHP.
- Jangan membuat matrix AHP terlalu kecil dan sulit dibaca.
- Jangan mengandalkan warna saja untuk membedakan sentiment.
- Jangan membuat UI terlalu ramai hanya agar terlihat modern.

---

# 17. Stitch Exploration Plan

Stitch digunakan untuk eksplorasi desain awal, bukan sebagai sumber final implementasi frontend.

## Prompt Variant 1 — Linear/Vercel Inspired

```txt
Create a professional light-mode research analytics dashboard for SentiRank, inspired by Linear and Vercel. The interface should be clean, technical, elegant, and minimal. Use white surfaces, slate gray background, navy text, blue accent, subtle cards, readable tables, and simple charts. The dashboard shows sentiment analysis results, aspect classification, AHP/Fuzzy AHP priority ranking, model performance, and recent negative Spotify reviews.
```

## Prompt Variant 2 — Stripe/SaaS Analytics Inspired

```txt
Create a polished light-mode SaaS analytics dashboard for SentiRank. The application analyzes Spotify user reviews using IndoBERT sentiment analysis, SVM aspect classification, and AHP/Fuzzy AHP prioritization. Use clean metric cards, soft shadows, blue accents, elegant charts, readable tables, and a professional product analytics layout.
```

## Prompt Variant 3 — Metabase/Grafana Inspired

```txt
Create a light-mode data analytics dashboard for SentiRank, inspired by Metabase and Grafana but less dense and more academic. The layout should include multiple analytical panels: total reviews, sentiment distribution, negative aspect ranking, model evaluation metrics, AHP/Fuzzy AHP ranking comparison, and review table. Use clear data hierarchy and avoid excessive decoration.
```

## Evaluation Rules for Stitch Output

Pilih output berdasarkan:

```txt
1. Kesesuaian dengan research analytics dashboard.
2. Kemudahan implementasi di NextJS.
3. Keterbacaan data.
4. Kesesuaian untuk skripsi.
5. Konsistensi dengan Light Mode.
6. Kemampuan dikembangkan ke banyak halaman.
```

Jangan pilih output hanya karena terlihat paling keren secara visual.

---

# 18. Implementation Impact

Hasil FE-01 akan memengaruhi fase berikutnya:

## FE-02 — Information Architecture

Arah desain ini akan digunakan untuk menyusun struktur halaman, navigasi, dan user flow.

## FE-03 — DESIGN.md

Arah visual “SentiRank Research Analytics Light” akan diterjemahkan menjadi design tokens dan rules di `frontend/DESIGN.md`.

## FE-04 — Wireframe

Wireframe akan memakai pola dashboard sidebar, summary cards, chart cards, tables, dan result panels.

## FE-05 — Component Map

Komponen akan disusun berdasarkan kebutuhan analytics dashboard:

```txt
StatCard
ChartCard
DataTable
MatrixTable
RankingCard
SentimentBadge
AspectBadge
PageHeader
AppSidebar
```

## FE-06 and Beyond

Implementasi NextJS akan mengikuti design references ini agar frontend konsisten.

---

# 19. FE-01 Acceptance Criteria

FE-01 dianggap selesai jika:

- [ ] Minimal 5 referensi desain sudah dianalisis.
- [ ] Minimal 3 referensi utama sudah dipilih.
- [ ] Arah visual SentiRank sudah ditentukan.
- [ ] Default Light Mode sudah diputuskan.
- [ ] Referensi yang ditolak sudah dijelaskan.
- [ ] Aturan visual awal sudah ditulis.
- [ ] Rekomendasi layout utama sudah ditentukan.
- [ ] Prompt Stitch untuk eksplorasi desain sudah disiapkan.
- [ ] Dokumen ini sudah disimpan sebagai `docs/frontend/design-references.md`.

---

# 20. Final Decision Summary

## Final Direction

```txt
SentiRank Research Analytics Light
```

## Main References

```txt
Linear
Vercel
Stripe-style SaaS Analytics
Metabase
Grafana
```

## Supporting References

```txt
Notion
Supabase
Google Cloud Console
GitHub Insights
Plausible Analytics
```

## Rejected Directions

```txt
Nike-style editorial/fashion UI
Cyberpunk dashboard
Heavy glassmorphism
Dark-mode-first dashboard
Landing page marketing style
E-commerce layout
```

## Final Design Statement

SentiRank akan dirancang sebagai aplikasi web dashboard analitik berbasis Light Mode yang bersih, profesional, akademik, dan data-driven. Desain berfokus pada keterbacaan data, alur analisis, dan interpretasi hasil sentiment analysis, aspect classification, serta AHP/Fuzzy AHP prioritization. Elemen visual yang digunakan harus mendukung penelitian dan demonstrasi sistem, bukan sekadar dekorasi.
