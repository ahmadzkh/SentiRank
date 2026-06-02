# Design Decision Log — SentiRank Frontend

## Document Information

| Field            | Description                        |
| ---------------- | ---------------------------------- |
| Project          | SentiRank                          |
| Module           | Frontend UI/UX                     |
| Document         | Design Decision Log                |
| Track            | Frontend Track                     |
| Current Phase    | FE-11 — AHP/Fuzzy AHP Prototype    |
| Default Theme    | Light Mode                         |
| Visual Direction | SentiRank Research Analytics Light |
| Status           | Draft                              |
| Last Updated     | 2026-06-02                         |

---

## 1. Purpose

Dokumen ini digunakan untuk mencatat keputusan desain frontend SentiRank secara sistematis. Setiap keputusan yang berkaitan dengan arah visual, struktur UI, layout, design system, komponen, dan integrasi frontend akan dicatat agar proses pengembangan frontend memiliki dasar yang jelas.

Design decision log ini juga berguna untuk mendukung dokumentasi skripsi, terutama ketika menjelaskan alasan pemilihan desain antarmuka, struktur halaman, dan pendekatan implementasi pada Bab 3 dan Bab 4.

---

## 2. Project Context

SentiRank adalah aplikasi web berbasis analisis sentimen untuk ulasan Spotify. Sistem ini dirancang untuk melakukan analisis sentimen, klasifikasi aspek, serta penyusunan prioritas aspek negatif menggunakan metode AHP dan Fuzzy AHP.

Frontend SentiRank harus mendukung beberapa kebutuhan utama:

- Menampilkan ringkasan dataset ulasan.
- Menampilkan hasil analisis sentimen.
- Menampilkan hasil klasifikasi aspek.
- Menampilkan evaluasi model.
- Menampilkan proses dan hasil AHP/Fuzzy AHP.
- Menyediakan tampilan yang mudah dipahami oleh dosen, peneliti, dan evaluator.
- Mendukung demonstrasi sistem dalam konteks skripsi.

Oleh karena itu, keputusan desain harus mengutamakan keterbacaan data, konsistensi UI, dan kesesuaian akademik.

---

## 3. Decision Format

Setiap keputusan dalam dokumen ini menggunakan format berikut:

```txt
Decision ID:
Phase:
Date:
Status:
Decision:
Reason:
Selected Option:
Rejected Options:
Impact:
Next Action:
```

Status keputusan menggunakan kategori berikut:

```txt
Draft      → Masih dapat berubah
Approved   → Disetujui sebagai keputusan aktif
Revised    → Sudah diubah dari keputusan sebelumnya
Deprecated → Tidak lagi digunakan
```

---

# FE-01 — Design References

## Decision ID

```txt
FE-01-D01
```

## Phase

```txt
FE-01 — Design References
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

SentiRank menggunakan visual direction:

```txt
SentiRank Research Analytics Light
```

Arah desain ini menempatkan SentiRank sebagai aplikasi web dashboard analitik berbasis Light Mode yang bersih, profesional, akademik, dan data-driven.

---

## Reason

Keputusan ini dibuat karena SentiRank bukan aplikasi e-commerce, bukan landing page marketing, bukan aplikasi fashion/editorial, dan bukan dashboard eksperimen visual. SentiRank adalah sistem penelitian yang membutuhkan penyajian data, hasil model, tabel, grafik, dan ranking prioritas secara jelas.

Alasan utama pemilihan visual direction ini:

- Project ini merupakan sistem analisis sentimen dan prioritas insight berbasis AHP/Fuzzy AHP.
- UI perlu mudah dibaca oleh dosen, peneliti, dan evaluator.
- Light Mode lebih cocok untuk screenshot laporan skripsi dan presentasi akademik.
- Dashboard harus menonjolkan data, bukan dekorasi visual.
- Struktur halaman harus mendukung proses analisis dari dataset, sentiment analysis, aspect classification, hingga AHP/Fuzzy AHP.
- Tampilan harus terlihat profesional tetapi tetap realistis untuk diimplementasikan dengan NextJS, Tailwind CSS, dan shadcn/ui.

---

## Selected References

Referensi utama yang dipilih:

```txt
1. Linear
2. Vercel
3. Stripe-style SaaS dashboard
4. Metabase
5. Grafana
```

### Linear

Linear dipilih karena memiliki interface yang bersih, presisi, dan modern. Referensi ini digunakan untuk mengambil inspirasi pada sidebar, spacing, hierarchy, dan kesan technical-product yang rapi.

### Vercel

Vercel dipilih karena memiliki gaya minimal, profesional, dan developer-oriented. Referensi ini digunakan untuk menjaga tampilan SentiRank tetap bersih, tajam, dan tidak berlebihan.

### Stripe-style SaaS Dashboard

Stripe-style dashboard dipilih karena cocok untuk metric cards, summary section, chart, table, dan layout analitik. Pola ini relevan untuk dashboard utama SentiRank.

### Metabase

Metabase dipilih karena sangat relevan dengan aplikasi data analytics. Referensi ini digunakan untuk pola chart, table, filter, dan eksplorasi data.

### Grafana

Grafana dipilih sebagai referensi struktur panel dashboard. Namun, visual identity Grafana tidak diikuti sepenuhnya karena SentiRank tetap menggunakan Light Mode dan tidak boleh terlalu padat seperti monitoring dashboard.

---

## Supporting References

Referensi pendukung:

```txt
1. Notion
2. Supabase
3. Google Cloud Console
4. GitHub Insights
5. Plausible Analytics
```

Referensi ini tidak digunakan sebagai basis utama, tetapi dapat membantu pada halaman tertentu seperti Reports, Settings, Dataset Management, dan API Integration Preparation.

---

## Rejected Directions

Arah desain yang ditolak:

```txt
1. Nike-style editorial/fashion interface
2. Cyberpunk dashboard
3. Heavy dark mode dashboard
4. Excessive glassmorphism
5. Landing-page marketing style
6. E-commerce layout
```

---

## Reason for Rejection

### Nike-style Editorial/Fashion Interface

Ditolak sebagai basis utama karena terlalu brand-heavy, editorial, dan cocok untuk e-commerce atau campaign visual. SentiRank membutuhkan dashboard analitik, bukan product showcase.

### Cyberpunk Dashboard

Ditolak karena terlalu dekoratif, biasanya memakai dark background, neon color, dan glow effect. Gaya ini kurang cocok untuk skripsi dan dapat mengurangi keterbacaan data.

### Heavy Dark Mode Dashboard

Ditolak sebagai default karena screenshot laporan skripsi dan presentasi akademik lebih aman menggunakan Light Mode. Dark Mode dapat disediakan di masa depan, tetapi bukan prioritas awal.

### Excessive Glassmorphism

Ditolak karena efek transparansi berlebihan dapat mengganggu readability, terutama pada tabel, chart, dan matrix AHP/Fuzzy AHP.

### Landing-page Marketing Style

Ditolak karena SentiRank bukan website promosi. SentiRank adalah aplikasi operasional untuk analisis data dan prioritas insight.

### E-commerce Layout

Ditolak karena tidak relevan dengan kebutuhan sistem. SentiRank tidak membutuhkan product grid, cart, checkout, atau campaign section.

---

## Impact

Keputusan FE-01 berdampak pada fase frontend berikutnya:

### Impact on FE-02 — Information Architecture

FE-02 akan menyusun struktur halaman berdasarkan alur dashboard analytics, bukan landing page. Struktur menu akan diarahkan ke modul analisis seperti Dashboard, Dataset, Sentiment Analysis, Aspect Classification, AHP/Fuzzy AHP, Model Evaluation, dan Reports.

### Impact on FE-03 — DESIGN.md

FE-03 akan membuat `DESIGN.md` dengan tema Light Mode. Design tokens akan menggunakan warna netral, aksen biru, surface putih, border lembut, dan typography bersih.

### Impact on FE-04 — Wireframe

FE-04 akan membuat wireframe berbasis dashboard shell, yaitu sidebar, topbar, page header, summary cards, chart cards, table cards, dan result panels.

### Impact on FE-05 — Component Map

FE-05 akan menyusun komponen reusable seperti AppSidebar, AppTopbar, PageHeader, StatCard, ChartCard, DataTable, MatrixTable, RankingCard, SentimentBadge, AspectBadge, LoadingState, EmptyState, dan ErrorState.

### Impact on FE-06 — NextJS Setup

FE-06 akan menggunakan stack yang sesuai dengan dashboard analytics, yaitu NextJS, TypeScript, Tailwind CSS, shadcn/ui, Recharts, dan TanStack Table jika diperlukan.

---

## Final Decision Summary

```txt
SentiRank menggunakan arah desain “SentiRank Research Analytics Light”.
Default theme adalah Light Mode.
Desain harus bersih, profesional, akademik, analitik, dan data-driven.
Referensi utama adalah Linear, Vercel, Stripe-style SaaS dashboard, Metabase, dan Grafana.
Desain yang terlalu editorial, cyberpunk, glassmorphism, dark-first, landing-page, dan e-commerce ditolak.
```

---

## Next Action

Langkah berikutnya:

```txt
1. Selesaikan dokumen `docs/frontend/design-references.md`.
2. Gunakan referensi FE-01 untuk menyusun `docs/frontend/information-architecture.md`.
3. Lanjut ke FE-02 — Information Architecture.
```

---

# FE-02 — Information Architecture

## Decision ID

```txt
FE-02-D01
```

## Phase

```txt
FE-02 — Information Architecture
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

Struktur navigasi frontend SentiRank akan menggunakan dashboard-based navigation dengan sidebar sebagai navigasi utama.

Dokumen information architecture disimpan di `docs/frontend/information-architecture.md`.

Rencana struktur menu awal:

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

---

## Reason

Struktur ini dipilih karena mengikuti alur kerja sistem SentiRank dari input data sampai output rekomendasi:

```txt
Dataset
→ Scraping
→ Preprocessing
→ Sentiment Analysis
→ Aspect Classification
→ AHP / Fuzzy AHP
→ Evaluation
→ Reports
```

Struktur ini juga memudahkan demonstrasi sistem kepada dosen atau evaluator karena setiap proses utama memiliki halaman khusus.

---

## Selected Option

```txt
Sidebar-based dashboard navigation
```

---

## Rejected Options

```txt
Top navigation only
Landing page-first structure
Single-page dashboard only
Wizard-only interface
```

---

## Reason for Rejection

Top navigation only ditolak karena jumlah modul cukup banyak. Landing page-first structure ditolak karena SentiRank bukan website promosi. Single-page dashboard only ditolak karena fitur sistem terlalu kompleks. Wizard-only interface ditolak karena dapat membatasi eksplorasi data dan hasil analisis.

---

## Impact

Keputusan ini akan memengaruhi:

- Struktur route NextJS.
- Struktur sidebar.
- Page grouping.
- Breadcrumb atau page header.
- Dokumentasi wireframe.
- Component map.

---

## Next Action

```txt
Gunakan `docs/frontend/information-architecture.md` sebagai input FE-03 saat fase FE-03 dimulai.
```

---

# FE-03 — DESIGN.md

## Decision ID

```txt
FE-03-D01
```

## Phase

```txt
FE-03 — DESIGN.md
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

Frontend SentiRank akan menggunakan file `frontend/DESIGN.md` sebagai design specification utama untuk menjaga konsistensi UI dan membantu AI coding agent memahami arah desain project.

Dokumen canonical design specification disimpan di `frontend/DESIGN.md` dengan arah `SentiRank Research Analytics Light`.

---

## Reason

`DESIGN.md` dibutuhkan agar pengembangan frontend tidak berjalan berdasarkan selera visual yang berubah-ubah. File ini akan menjadi referensi untuk:

- Warna.
- Typography.
- Spacing.
- Border radius.
- Shadow.
- Layout rules.
- Component rules.
- Chart rules.
- Table rules.
- Accessibility rules.
- Do and don't.

---

## Selected Option

```txt
Use `frontend/DESIGN.md` as the canonical frontend design specification.
```

---

## Rejected Options

```txt
No design specification
Only use screenshots from Stitch
Only rely on Tailwind defaults
Only rely on shadcn/ui default style
```

---

## Reason for Rejection

Tanpa design specification, UI berisiko tidak konsisten. Screenshot dari Stitch hanya visual reference, bukan aturan implementasi. Tailwind dan shadcn/ui menyediakan utility/component base, tetapi tetap membutuhkan design direction agar hasilnya sesuai dengan SentiRank.

---

## Impact

Keputusan ini akan memengaruhi:

- Setup Tailwind.
- Pemilihan warna UI.
- Desain komponen.
- Implementasi halaman.
- Konsistensi hasil coding menggunakan Codex atau AI agent.
- Dokumentasi frontend.

---

## Next Action

```txt
Gunakan `frontend/DESIGN.md` sebagai input FE-04 saat fase FE-04 dimulai.
```

---

# FE-04 — Wireframe

## Decision ID

```txt
FE-04-D01
```

## Phase

```txt
FE-04 — Wireframe
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

Wireframe SentiRank akan menggunakan struktur dashboard shell dengan sidebar kiri, topbar, page header, summary section, dan content cards.

Dokumen textual wireframe disimpan di `docs/frontend/wireframes.md`.

---

## Reason

Struktur ini cocok untuk aplikasi analitik karena:

- Navigasi antar modul jelas.
- Summary cards dapat menampilkan metrik utama.
- Chart dan table dapat dikelompokkan secara rapi.
- Hasil AHP/Fuzzy AHP dapat ditampilkan dalam bentuk matrix, ranking, dan explanation cards.
- Layout mudah diimplementasikan dengan NextJS dan Tailwind.

---

## Selected Option

```txt
Sidebar dashboard layout
```

---

## Rejected Options

```txt
Landing page layout
Full-screen single view
Mobile-first app layout
Dense monitoring dashboard layout
```

---

## Reason for Rejection

Landing page layout tidak cocok untuk aplikasi operasional. Full-screen single view terlalu terbatas. Mobile-first app layout bukan prioritas karena demo skripsi kemungkinan besar dilakukan di laptop. Dense monitoring dashboard terlalu padat untuk user akademik.

---

## Impact

Keputusan ini akan memengaruhi:

- Layout utama.
- Komponen AppSidebar.
- Komponen AppTopbar.
- Komponen PageHeader.
- Struktur halaman Dashboard.
- Struktur halaman AHP/Fuzzy AHP.

---

## Next Action

```txt
Gunakan `docs/frontend/wireframes.md` sebagai input FE-05 saat fase FE-05 dimulai.
```

---

# FE-05 — Component Map

## Decision ID

```txt
FE-05-D01
```

## Phase

```txt
FE-05 — Component Map
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

Frontend SentiRank akan menggunakan komponen reusable untuk menjaga konsistensi dan mengurangi duplikasi kode.

Dokumen component map disimpan di `docs/frontend/component-map.md`.

Komponen awal yang direncanakan:

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
LoadingState
EmptyState
ErrorState
```

---

## Reason

SentiRank memiliki banyak halaman dengan pola UI serupa. Tanpa component map, implementasi akan cepat menjadi tidak konsisten dan sulit dirawat.

---

## Selected Option

```txt
Reusable component-based frontend architecture
```

---

## Rejected Options

```txt
Page-specific components only
Copy-paste UI per page
Single monolithic dashboard component
```

---

## Reason for Rejection

Page-specific-only approach akan membuat UI sulit distandarkan. Copy-paste UI meningkatkan risiko inkonsistensi. Single monolithic dashboard component akan sulit dirawat dan tidak scalable.

---

## Impact

Keputusan ini akan memengaruhi:

- Struktur folder `components/`.
- Pola import component.
- Implementasi halaman.
- Maintainability frontend.
- Kecepatan pengembangan FE-08 sampai FE-11.

---

## Next Action

```txt
Gunakan `docs/frontend/component-map.md` sebagai input FE-06 saat fase FE-06 dimulai.
```

---

# FE-06 — NextJS Setup

## Decision ID

```txt
FE-06-D01
```

## Phase

```txt
FE-06 — NextJS Setup
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

Frontend SentiRank akan dibangun menggunakan NextJS App Router, TypeScript, Tailwind CSS, dan shadcn/ui.

---

## Reason

Stack ini dipilih karena:

- NextJS cocok untuk aplikasi web dashboard modern.
- TypeScript membantu menjaga struktur data dan kontrak API.
- Tailwind CSS mempercepat styling berbasis design system.
- shadcn/ui menyediakan komponen dasar yang fleksibel.
- Stack ini mudah diintegrasikan dengan FastAPI backend.

---

## Selected Option

```txt
NextJS + TypeScript + Tailwind CSS + shadcn/ui
```

---

## Rejected Options

```txt
Plain HTML/CSS/JS
React Vite only
Vue/Nuxt
Angular
Streamlit frontend final
```

---

## Reason for Rejection

Plain HTML/CSS/JS kurang scalable. React Vite bisa digunakan, tetapi NextJS lebih kuat untuk struktur aplikasi dan routing. Vue/Nuxt dan Angular tidak sesuai dengan arah stack yang sudah direncanakan. Streamlit hanya cocok untuk prototype ML, bukan frontend final skripsi berbasis web app profesional.

---

## Impact

Keputusan ini akan memengaruhi:

- Struktur folder frontend.
- Routing halaman.
- Setup package.
- Pilihan komponen UI.
- Integrasi API ke FastAPI.
- Dokumentasi implementasi Bab 4.

---

## Next Action

```txt
Gunakan setup NextJS di `frontend/` sebagai foundation FE-07 saat fase mock data dan types dimulai.
```

---

# FE-07 — Mock Data and Types

## Decision ID

```txt
FE-07-D01
```

## Phase

```txt
FE-07 — Mock Data and Types
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

Frontend akan menggunakan mock data dan TypeScript types sebelum backend API stabil.

---

## Reason

AHP/Fuzzy AHP dan beberapa endpoint backend masih dalam tahap pengembangan. Mock data dibutuhkan agar frontend tetap dapat berjalan paralel tanpa menunggu backend selesai.

---

## Selected Option

```txt
Mock-first frontend development
```

---

## Rejected Options

```txt
Wait until all backend endpoints are final
Hardcode UI data directly in components
Build frontend only after AHP/Fuzzy AHP final
```

---

## Reason for Rejection

Menunggu backend final akan memperlambat pengembangan. Hardcode data langsung di komponen akan menyulitkan integrasi API. Menunda frontend sampai metode final selesai tidak efisien karena banyak halaman tidak bergantung langsung pada finalisasi AHP/Fuzzy AHP.

---

## Impact

Keputusan ini akan memengaruhi:

- File `types/`.
- File `lib/mock-data.ts`.
- Struktur API contract.
- Pengembangan dashboard.
- Pengembangan AHP/Fuzzy AHP prototype.

---

## Next Action

```txt
Gunakan TypeScript types dan mock data FE-07 sebagai input FE-08 saat fase main layout dimulai.
```

---

# FE-08 — Main Layout

## Decision ID

```txt
FE-08-D01
```

## Phase

```txt
FE-08 — Layout Utama
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

Layout utama SentiRank akan menggunakan dashboard app shell dengan sidebar kiri dan main content area.

---

## Reason

Dashboard app shell cocok untuk aplikasi yang memiliki banyak modul analitik dan navigasi internal.

---

## Selected Option

```txt
Sidebar + Topbar + Main Content Layout
```

---

## Rejected Options

```txt
Topbar-only layout
Mobile app style layout
Landing page style layout
```

---

## Impact

Keputusan ini akan memengaruhi:

- `app/layout.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/AppTopbar.tsx`
- `components/layout/PageHeader.tsx`
- Semua halaman utama.

---

## Next Action

```txt
Gunakan layout utama FE-08 sebagai foundation FE-09 saat fase dashboard dimulai.
```

---

# FE-09 — Dashboard

## Decision ID

```txt
FE-09-D01
```

## Phase

```txt
FE-09 — Dashboard
```

## Date

```txt
2026-05-30
```

## Status

```txt
Approved
```

---

## Decision

Dashboard utama SentiRank akan menampilkan ringkasan analisis dalam bentuk metric cards, charts, preview table, dan ranking priority preview.

---

## Reason

Dashboard harus menjadi halaman pertama yang memberi gambaran umum sistem dan hasil analisis.

---

## Selected Dashboard Sections

```txt
Total Reviews
Positive Reviews
Neutral Reviews
Negative Reviews
Top Negative Aspect
Priority Score
Sentiment Distribution Chart
Negative Aspect Ranking Chart
Model Performance Summary
AHP/Fuzzy AHP Priority Preview
Latest Negative Reviews Table
Short Recommendation Summary
```

---

## Rejected Options

```txt
Dashboard hanya berisi chart
Dashboard hanya berisi tabel
Dashboard sebagai landing page marketing
Dashboard terlalu padat seperti monitoring system
```

---

## Impact

Keputusan ini akan memengaruhi:

- Struktur dashboard page.
- Mock data dashboard.
- Chart components.
- StatCard component.
- ReviewTable component.

---

## Next Action

```txt
Gunakan dashboard FE-09 sebagai input FE-10 saat fase core pages dimulai.
```

---

# FE-10 — Core Pages

## Decision ID

```txt
FE-10-D01
```

## Phase

```txt
FE-10 — Core Pages
```

## Date

```txt
2026-06-02
```

## Status

```txt
Approved
```

---

## Decision

Core pages SentiRank dibuat setelah dashboard sebagai halaman mock-first untuk Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification, Model Evaluation, Reports, dan Settings.

Route AHP / Fuzzy AHP tetap tersedia hanya sebagai placeholder FE-11 agar navigasi lengkap tanpa memulai prototype penuh.

---

## Reason

Halaman tersebut merupakan inti alur demo skripsi dan relatif stabil untuk dibangun dengan mock data sebelum integrasi API. AHP/Fuzzy AHP masih dipisahkan karena detail prototype, matrix, pairwise input, dan kalkulasi metode penuh didefer ke FE-11.

---

## Selected Core Pages

```txt
Dataset
Scraping
Preprocessing
Sentiment Analysis
Aspect Classification
Model Evaluation
Reports
Settings
```

---

## Deferred Pages

```txt
AHP / Fuzzy AHP final implementation
API integration final
```

---

## Impact

Keputusan ini menjaga pengembangan frontend tetap paralel tanpa tergantung penuh pada finalisasi metode AHP/Fuzzy AHP, sekaligus menyediakan route inti yang siap digunakan untuk demo skripsi.

---

## Next Action

```txt
Lanjut ke FE-11 untuk membuat prototype AHP/Fuzzy AHP yang fleksibel, data-driven, dan tetap tidak melakukan real API call sampai FE-12.
```

---

# FE-11 — AHP/Fuzzy AHP Prototype

## Decision ID

```txt
FE-11-D01
```

## Phase

```txt
FE-11 — AHP/Fuzzy AHP Prototype
```

## Date

```txt
2026-06-02
```

## Status

```txt
Approved
```

---

## Decision

Halaman AHP/Fuzzy AHP dibuat sebagai frontend prototype fleksibel dan data-driven menggunakan mock data, tanpa real API call dan tanpa kalkulasi AHP/Fuzzy AHP aktual di frontend.

---

## Reason

Phase metodologi AHP/Fuzzy AHP masih berjalan paralel. Karena itu, frontend tidak boleh mengunci struktur final criteria, pairwise comparison, TFN, Consistency Ratio, dan final ranking sebelum backend calculation service dan metodologi final siap.

---

## Selected Option

```txt
Flexible mock-based AHP/Fuzzy AHP prototype
```

## Selected Prototype Sections

```txt
Page Header
Method Overview
Criteria Setup Preview
Expert Judgement / Pairwise Comparison Preview
AHP Pairwise Comparison Matrix
Consistency Ratio Card
AHP Weight Result
Fuzzy AHP Weight Result
AHP vs Fuzzy AHP Ranking Comparison
Final Recommendation Summary
Method Limitation / Prototype Note
```

---

## Rejected Options

```txt
Hardcoded AHP criteria
Hardcoded pairwise matrix
Final AHP/Fuzzy AHP UI before methodology is finalized
Performing full AHP calculation in frontend
```

---

## Reason for Rejection

Hardcoded criteria dan matrix akan menyulitkan revisi jika desain metode berubah. Full calculation sebaiknya tetap dilakukan di backend/service agar logic metodologis terpusat dan dapat diuji.

---

## Impact

Keputusan ini akan memengaruhi:

- `types/ahp.ts`
- `types/fuzzy-ahp.ts`
- `MatrixTable`
- `RankingCard`
- `RecommendationCard`
- `ConsistencyBadge`
- `PairwiseComparisonInput`
- `CriteriaEditor`
- AHP/Fuzzy AHP page
- API contract untuk calculation service

---

## Next Action

```txt
Lanjut ke FE-12 untuk menyiapkan API contract dan integration preparation tanpa mengubah frontend prototype menjadi calculation service.
```

---

# FE-12 — API Integration Preparation

## Decision ID

```txt
FE-12-D01
```

## Phase

```txt
FE-12 — API Integration Preparation
```

## Date

```txt
TBD
```

## Status

```txt
Draft
```

---

## Decision

Frontend akan menyiapkan API client dan API contract sebelum integrasi penuh dengan FastAPI.

---

## Reason

Frontend dan backend berjalan paralel. API contract dibutuhkan agar integrasi tidak dilakukan secara improvisasi.

---

## Selected Option

```txt
API contract-first integration preparation
```

---

## Planned API Groups

```txt
Review API
Dataset API
Sentiment API
Aspect API
Model Evaluation API
AHP API
Fuzzy AHP API
Report API
```

---

## Rejected Options

```txt
Direct fetch scattered in every component
No API abstraction
Integrate only after all pages are done
```

---

## Reason for Rejection

Direct fetch di setiap component akan membuat code sulit dirawat. Tanpa API abstraction, error handling dan loading state akan tidak konsisten. Menunggu semua halaman selesai sebelum menyiapkan API contract akan memperbesar risiko refactor.

---

## Impact

Keputusan ini akan memengaruhi:

- `lib/api.ts`
- `lib/http-client.ts`
- `types/api.ts`
- environment variable frontend
- backend endpoint documentation
- loading/error state handling

---

## Next Action

```txt
Buat API contract draft dan HTTP client wrapper setelah mock data/types stabil.
```

---

# Final Notes

Dokumen ini akan diperbarui setiap kali terdapat keputusan desain baru pada frontend SentiRank. Setiap keputusan yang berdampak pada struktur UI, design system, komponen, route, atau integrasi harus dicatat agar proses pengembangan dapat diaudit dan dijelaskan kembali dalam dokumentasi skripsi.

## Current Active Decision Summary

```txt
Active Visual Direction:
SentiRank Research Analytics Light

Default Theme:
Light Mode

Frontend Design Approach:
Dashboard-based analytics application

Primary References:
Linear, Vercel, Stripe-style SaaS Dashboard, Metabase, Grafana

Frontend Stack Plan:
NextJS, TypeScript, Tailwind CSS, shadcn/ui

Development Strategy:
Mock-first, API-contract-ready, component-based
```
