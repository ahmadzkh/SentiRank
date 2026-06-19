# Frontend Track Task List — SentiRank

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision

## Main Frontend Roadmap

- [x] FE-01 — Design references selesai
- [x] FE-02 — Information architecture selesai
- [x] FE-03 — DESIGN.md selesai
- [x] FE-04 — Wireframe selesai
- [x] FE-05 — Component map selesai
- [x] FE-06 — NextJS setup selesai
- [x] FE-07 — Mock data dan types selesai
- [x] FE-08 — Layout utama selesai
- [x] FE-09 — Dashboard selesai
- [x] FE-10 — Core pages selesai
- [x] FE-11 — AHP/Fuzzy AHP prototype selesai
- [x] FE-12 — API integration preparation selesai

---

## FE-01 — Design References

### Objective

Menentukan arah visual awal untuk frontend SentiRank sebagai aplikasi web analitik berbasis Light Mode, dengan fokus pada sentiment analysis, aspect classification, dan AHP/Fuzzy AHP prioritization.

### Tasks

- [x] Kumpulkan minimal 5 referensi desain UI.
- [x] Pilih minimal 3 referensi utama.
- [x] Catat alasan memilih setiap referensi.
- [x] Catat elemen visual yang akan diadaptasi.
- [x] Catat elemen visual yang tidak akan digunakan.
- [x] Tentukan arah visual final sementara.
- [x] Buat ringkasan visual direction SentiRank.
- [x] Update `docs/frontend/design-references.md`.
- [x] Update `docs/frontend/design-decision-log.md`.

### Acceptance Criteria

FE-01 dianggap selesai jika:

- [x] `docs/frontend/design-references.md` sudah berisi minimal 5 referensi.
- [x] Minimal 3 referensi utama sudah dipilih.
- [x] Visual direction SentiRank sudah ditentukan.
- [x] Light Mode dipilih sebagai default.
- [x] Alasan desain terdokumentasi dengan jelas.
- [x] Checklist FE-01 di file ini ditandai selesai.

### Completion Note

Completed on 2026-05-30. FE-01 references and decision log were audited: design references include 10 references with 5 primary references, Light Mode is the default theme, the visual direction is `SentiRank Research Analytics Light`, and `FE-01-D01` is recorded as approved.

### Final Decision

Visual direction selected:

```txt
SentiRank Research Analytics Light
```

Design keywords:

```txt
clean, academic, analytical, professional, light-mode, SaaS dashboard, readable, elegant
```

---

## FE-02 — Information Architecture

### Objective

Menyusun information architecture frontend SentiRank sebagai dashboard analitik berbasis Light Mode, mock-first, dan siap diarahkan ke NextJS App Router pada fase implementasi berikutnya.

### Tasks

- [x] Definisikan application purpose.
- [x] Definisikan target users.
- [x] Definisikan main navigation structure.
- [x] Definisikan page hierarchy.
- [x] Definisikan route plan untuk NextJS App Router.
- [x] Definisikan purpose setiap halaman.
- [x] Definisikan data yang ditampilkan pada setiap halaman.
- [x] Definisikan user actions pada setiap halaman.
- [x] Definisikan relationship antar halaman.
- [x] Definisikan recommended user flow untuk demo skripsi.
- [x] Definisikan acceptance criteria FE-02.
- [x] Buat `docs/frontend/information-architecture.md`.

### Acceptance Criteria

FE-02 dianggap selesai jika:

- [x] `docs/frontend/information-architecture.md` sudah dibuat.
- [x] Application purpose sudah dijelaskan.
- [x] Target users sudah dijelaskan.
- [x] Main navigation structure sudah dijelaskan.
- [x] Page hierarchy sudah dijelaskan.
- [x] NextJS App Router route plan sudah dijelaskan.
- [x] Page-by-page purpose sudah dijelaskan.
- [x] Data shown on each page sudah dijelaskan.
- [x] User actions on each page sudah dijelaskan.
- [x] Relationship between pages sudah dijelaskan.
- [x] Recommended user flow untuk demo skripsi sudah dijelaskan.
- [x] Dokumen tetap sesuai dengan SentiRank Research Analytics Light.
- [x] Light Mode tetap menjadi default.
- [x] Pendekatan mock-first dan API-contract-ready tetap digunakan.
- [x] FE-03 sampai FE-12 belum dimulai.

### Completion Note

Completed on 2026-05-30. FE-02 information architecture is documented in `docs/frontend/information-architecture.md`, including purpose, target users, navigation, page hierarchy, NextJS App Router route plan, page data, user actions, page relationships, and recommended demo flow.

### Final Decision

Information architecture selected:

```txt
Dashboard-based analytics application with sidebar navigation
```

Primary demo flow:

```txt
Dashboard -> Dataset -> Preprocessing -> Sentiment Analysis -> Aspect Classification -> AHP / Fuzzy AHP -> Model Evaluation -> Reports
```

---

## FE-03 — DESIGN.md

### Objective

Menyusun `frontend/DESIGN.md` sebagai spesifikasi desain canonical untuk frontend SentiRank dengan arah `SentiRank Research Analytics Light`.

### Tasks

- [x] Buat folder `frontend/` jika belum tersedia.
- [x] Buat `frontend/DESIGN.md`.
- [x] Definisikan product identity.
- [x] Definisikan design goals.
- [x] Definisikan visual principles.
- [x] Tetapkan Light Mode sebagai default theme.
- [x] Definisikan color tokens.
- [x] Definisikan typography tokens.
- [x] Definisikan spacing tokens.
- [x] Definisikan border radius tokens.
- [x] Definisikan shadow/elevation tokens.
- [x] Definisikan layout rules.
- [x] Definisikan sidebar rules.
- [x] Definisikan topbar rules.
- [x] Definisikan card rules.
- [x] Definisikan table rules.
- [x] Definisikan chart rules.
- [x] Definisikan badge rules.
- [x] Definisikan button rules.
- [x] Definisikan form/input rules.
- [x] Definisikan page-specific design rules.
- [x] Definisikan AHP/Fuzzy AHP interface rules.
- [x] Definisikan accessibility rules.
- [x] Definisikan Do and Don't.
- [x] Definisikan implementation notes untuk NextJS, Tailwind CSS, dan shadcn/ui.
- [x] Update `docs/frontend/design-decision-log.md`.

### Acceptance Criteria

FE-03 dianggap selesai jika:

- [x] `frontend/DESIGN.md` sudah dibuat.
- [x] Product identity sudah dijelaskan.
- [x] Design goals sudah dijelaskan.
- [x] Visual principles sudah dijelaskan.
- [x] Light Mode ditetapkan sebagai default theme.
- [x] Color tokens sudah dijelaskan.
- [x] Typography tokens sudah dijelaskan.
- [x] Spacing tokens sudah dijelaskan.
- [x] Border radius tokens sudah dijelaskan.
- [x] Shadow/elevation tokens sudah dijelaskan.
- [x] Layout rules sudah dijelaskan.
- [x] Sidebar rules sudah dijelaskan.
- [x] Topbar rules sudah dijelaskan.
- [x] Card rules sudah dijelaskan.
- [x] Table rules sudah dijelaskan.
- [x] Chart rules sudah dijelaskan.
- [x] Badge rules sudah dijelaskan.
- [x] Button rules sudah dijelaskan.
- [x] Form/input rules sudah dijelaskan.
- [x] Page-specific design rules sudah dijelaskan.
- [x] AHP/Fuzzy AHP interface rules sudah dijelaskan.
- [x] Accessibility rules sudah dijelaskan.
- [x] Do and Don't sudah dijelaskan.
- [x] Implementation notes untuk NextJS, Tailwind CSS, dan shadcn/ui sudah dijelaskan.
- [x] Dokumen selaras dengan Light Mode, dashboard analytics, blue accent, white cards, dan slate/off-white background.
- [x] FE-04 sampai FE-12 belum dimulai.
- [x] Tidak ada setup NextJS, package install, atau implementation code yang dibuat.

### Completion Note

Completed on 2026-05-30. `frontend/DESIGN.md` now defines the canonical frontend design specification for SentiRank Research Analytics Light, including design tokens, layout rules, component rules, AHP/Fuzzy AHP interface rules, accessibility rules, and implementation notes for future NextJS, Tailwind CSS, and shadcn/ui work.

### Final Decision

Canonical frontend design specification selected:

```txt
SentiRank Research Analytics Light
```

Default implementation direction:

```txt
Light Mode dashboard analytics with blue accent, white cards, slate/off-white background, readable tables, and minimal charts
```

---

## FE-04 — Wireframe

### Objective

Menyusun `docs/frontend/wireframes.md` sebagai wireframe tekstual untuk seluruh halaman utama SentiRank berdasarkan FE-02 information architecture dan `frontend/DESIGN.md`.

### Tasks

- [x] Buat `docs/frontend/wireframes.md`.
- [x] Definisikan global app shell wireframe.
- [x] Definisikan Dashboard wireframe.
- [x] Definisikan Dataset wireframe.
- [x] Definisikan Scraping wireframe.
- [x] Definisikan Preprocessing wireframe.
- [x] Definisikan Sentiment Analysis wireframe.
- [x] Definisikan Aspect Classification wireframe.
- [x] Definisikan AHP / Fuzzy AHP wireframe.
- [x] Definisikan Model Evaluation wireframe.
- [x] Definisikan Reports wireframe.
- [x] Definisikan Settings wireframe.
- [x] Tambahkan purpose, layout, header, summary cards, main content, table/chart/form, state notes, user actions, data requirements, dan responsive notes untuk setiap halaman.
- [x] Pastikan Dashboard mendukung demo flow skripsi.
- [x] Pastikan AHP/Fuzzy AHP tetap fleksibel, data-driven, dan prototype-ready.
- [x] Update `docs/frontend/design-decision-log.md`.

### Acceptance Criteria

FE-04 dianggap selesai jika:

- [x] `docs/frontend/wireframes.md` sudah dibuat.
- [x] Dashboard wireframe sudah dijelaskan.
- [x] Dataset wireframe sudah dijelaskan.
- [x] Scraping wireframe sudah dijelaskan.
- [x] Preprocessing wireframe sudah dijelaskan.
- [x] Sentiment Analysis wireframe sudah dijelaskan.
- [x] Aspect Classification wireframe sudah dijelaskan.
- [x] AHP / Fuzzy AHP wireframe sudah dijelaskan.
- [x] Model Evaluation wireframe sudah dijelaskan.
- [x] Reports wireframe sudah dijelaskan.
- [x] Settings wireframe sudah dijelaskan.
- [x] Setiap page wireframe mencakup purpose, layout, header, summary cards, main content, table/chart/form sections, empty/loading/error states, user actions, data requirements, dan responsive notes.
- [x] Dashboard mendukung demo flow skripsi.
- [x] AHP/Fuzzy AHP tidak hardcode final criteria count.
- [x] AHP/Fuzzy AHP tidak mengunci final Fuzzy AHP formula UI.
- [x] AHP/Fuzzy AHP diperlakukan sebagai prototype-ready.
- [x] Wireframe tetap sesuai SentiRank Research Analytics Light, Light Mode, sidebar/topbar/main layout, white cards, slate/off-white background, blue accent, readable tables, dan minimal charts.
- [x] FE-05 sampai FE-12 belum dimulai.
- [x] Tidak ada setup NextJS, package install, atau implementation code yang dibuat.

### Completion Note

Completed on 2026-05-30. `docs/frontend/wireframes.md` now defines textual wireframes for Dashboard, Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification, AHP / Fuzzy AHP, Model Evaluation, Reports, and Settings, aligned with SentiRank Research Analytics Light.

### Final Decision

Wireframe direction selected:

```txt
Sidebar + topbar + main content dashboard wireframes
```

Special method constraint:

```txt
AHP / Fuzzy AHP remains flexible, data-driven, and prototype-ready.
```

---

## FE-05 — Component Map

### Objective

Menyusun `docs/frontend/component-map.md` sebagai peta komponen reusable frontend SentiRank berdasarkan information architecture, wireframes, dan `frontend/DESIGN.md`.

### Tasks

- [x] Buat `docs/frontend/component-map.md`.
- [x] Definisikan Layout Components.
- [x] Definisikan Card Components.
- [x] Definisikan Table Components.
- [x] Definisikan Chart Components.
- [x] Definisikan Badge and Status Components.
- [x] Definisikan Form and Input Components.
- [x] Definisikan State Components.
- [x] Definisikan Page-specific Composition.
- [x] Untuk setiap komponen, definisikan purpose.
- [x] Untuk setiap komponen, definisikan halaman pemakaian.
- [x] Untuk setiap komponen, definisikan props/data requirements.
- [x] Untuk setiap komponen, definisikan visual rules.
- [x] Untuk setiap komponen, definisikan interaction behavior.
- [x] Untuk setiap komponen, definisikan empty/loading/error state jika relevan.
- [x] Untuk setiap komponen, definisikan implementation notes untuk NextJS, TypeScript, Tailwind CSS, dan shadcn/ui.
- [x] Pastikan komponen AHP/Fuzzy AHP fleksibel, data-driven, dan tidak mengunci final criteria count atau final Fuzzy AHP output.
- [x] Update `docs/frontend/design-decision-log.md`.

### Acceptance Criteria

FE-05 dianggap selesai jika:

- [x] `docs/frontend/component-map.md` sudah dibuat.
- [x] Layout Components sudah dijelaskan.
- [x] Card Components sudah dijelaskan.
- [x] Table Components sudah dijelaskan.
- [x] Chart Components sudah dijelaskan.
- [x] Badge and Status Components sudah dijelaskan.
- [x] Form and Input Components sudah dijelaskan.
- [x] State Components sudah dijelaskan.
- [x] Page-specific Composition sudah dijelaskan.
- [x] Setiap komponen memiliki purpose.
- [x] Setiap komponen memiliki informasi halaman pemakaian.
- [x] Setiap komponen memiliki props/data requirements.
- [x] Setiap komponen memiliki visual rules.
- [x] Setiap komponen memiliki interaction behavior.
- [x] Setiap komponen memiliki empty/loading/error state guidance jika relevan.
- [x] Setiap komponen memiliki implementation notes untuk NextJS, TypeScript, Tailwind CSS, dan shadcn/ui.
- [x] Komponen selaras dengan SentiRank Research Analytics Light.
- [x] Komponen mendukung Light Mode default.
- [x] Komponen mock-data friendly dan API-contract-ready.
- [x] Komponen AHP/Fuzzy AHP fleksibel dan data-driven.
- [x] Tidak ada hardcode final AHP criteria count.
- [x] Final Fuzzy AHP method output tidak dikunci.
- [x] Tables memprioritaskan readability.
- [x] Charts tetap minimal dan interpretable.
- [x] FE-06 sampai FE-12 belum dimulai.
- [x] Tidak ada setup NextJS, package install, atau implementation code yang dibuat.

### Completion Note

Completed on 2026-05-30. `docs/frontend/component-map.md` now defines reusable component contracts for SentiRank layout, cards, tables, charts, badges, forms, states, and page compositions, aligned with Light Mode and SentiRank Research Analytics Light.

### Final Decision

Component architecture selected:

```txt
Reusable component-based frontend architecture
```

Special method constraint:

```txt
AHP / Fuzzy AHP components remain flexible, data-driven, and prototype-ready.
```

---

## FE-06 — NextJS Setup

### Objective

Menyiapkan foundation frontend SentiRank menggunakan NextJS App Router, TypeScript, Tailwind CSS, ESLint, shadcn/ui, dan dependency UI/chart yang dibutuhkan untuk fase implementasi berikutnya.

### Task Checklist

- [x] Setup NextJS App Router pada folder `frontend/`.
- [x] Setup TypeScript.
- [x] Setup Tailwind CSS.
- [x] Setup ESLint.
- [x] Initialize shadcn/ui.
- [x] Install `lucide-react`.
- [x] Install `recharts`.
- [x] Install `clsx`.
- [x] Install `tailwind-merge`.
- [x] Install `class-variance-authority`.
- [x] Buat struktur folder kosong untuk layout, cards, tables, charts, badges, forms, states, ui, constants, hooks, lib, dan types.
- [x] Buat `frontend/README.md` dengan setup instructions.
- [x] Pastikan `frontend/DESIGN.md` tetap utuh.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.
- [x] Tidak mengimplementasikan dashboard pages.
- [x] Tidak membuat mock data.
- [x] Tidak mengimplementasikan full layout.
- [x] Tidak memulai FE-07 atau fase setelahnya.

### Acceptance Criteria

- [x] `frontend/app/` tersedia dan menggunakan NextJS App Router.
- [x] TypeScript tersedia melalui `tsconfig.json` dan konfigurasi project NextJS.
- [x] Tailwind CSS tersedia melalui `app/globals.css`, `postcss.config.mjs`, dan `tailwind.config.ts`.
- [x] ESLint tersedia melalui `eslint.config.mjs` dan script `npm run lint`.
- [x] shadcn/ui terinisialisasi melalui `components.json`.
- [x] Dependency `lucide-react`, `recharts`, `clsx`, `tailwind-merge`, dan `class-variance-authority` sudah terpasang.
- [x] Struktur folder frontend sesuai kebutuhan fase berikutnya.
- [x] `frontend/README.md` menjelaskan setup dan checks.
- [x] `frontend/DESIGN.md` tidak dihapus atau ditimpa.
- [x] Tidak ada dashboard implementation, mock data, atau full layout implementation.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.

### Completion Note

Completed on 2026-05-30. FE-06 NextJS foundation is set up in `frontend/` with App Router, TypeScript, Tailwind CSS, ESLint, shadcn/ui configuration, required UI/chart dependencies, empty future-phase folders, and README instructions. `frontend/DESIGN.md` remains intact, and both `npm run lint` and `npm run build` pass.

### Final Decision

Frontend foundation selected:

```txt
NextJS App Router + TypeScript + Tailwind CSS + ESLint + shadcn/ui
```

Implementation scope:

```txt
Foundation only. Dashboard pages, mock data, full layout, and API integration are deferred to later phases.
```

---

## FE-07 — Mock Data and Types

### Objective

Menyediakan TypeScript types, constants, dan mock data sintetis untuk frontend SentiRank agar fase berikutnya dapat dibangun secara mock-first dan tetap siap terhadap integrasi API.

### Task Checklist

- [x] Buat `frontend/types/review.ts`.
- [x] Buat `frontend/types/sentiment.ts`.
- [x] Buat `frontend/types/aspect.ts`.
- [x] Buat `frontend/types/ahp.ts`.
- [x] Buat `frontend/types/fuzzy-ahp.ts`.
- [x] Buat `frontend/types/evaluation.ts`.
- [x] Buat `frontend/types/report.ts`.
- [x] Buat `frontend/types/api.ts`.
- [x] Buat `frontend/types/navigation.ts`.
- [x] Buat `frontend/types/index.ts`.
- [x] Buat constants untuk navigation, sentiment, aspect, routes, dan barrel export.
- [x] Buat `frontend/lib/mock-data.ts`.
- [x] Tambahkan mock reviews dengan konteks Spotify dan label positive, neutral, negative.
- [x] Tambahkan mock sentiment summary.
- [x] Tambahkan mock aspect summary.
- [x] Tambahkan mock AHP criteria dan AHP result.
- [x] Tambahkan mock Fuzzy AHP result.
- [x] Tambahkan mock model evaluation.
- [x] Tambahkan mock report summary.
- [x] Tambahkan mock navigation items.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.
- [x] Tidak mengimplementasikan main layout.
- [x] Tidak mengimplementasikan dashboard UI.
- [x] Tidak membuat core pages.
- [x] Tidak memulai FE-08 atau fase setelahnya.

### Acceptance Criteria

- [x] Semua required type definitions tersedia dan reusable untuk integrasi API berikutnya.
- [x] `ApiResponse<T>` dan `PaginatedResponse<T>` tersedia untuk kontrak response backend.
- [x] Mock data realistis tetapi sintetis.
- [x] Mock data menggunakan konteks Spotify reviews.
- [x] Mock data memiliki contoh sentiment positive, neutral, dan negative.
- [x] Aspect labels relevan dengan review Spotify.
- [x] AHP/Fuzzy AHP mock data fleksibel dan data-driven.
- [x] Tidak ada asumsi bahwa jumlah final AHP criteria tidak akan berubah.
- [x] Tidak ada kalkulasi AHP/Fuzzy AHP aktual di frontend.
- [x] Mock data diberi batasan sebagai data UI development.
- [x] Constants route dan navigation selaras dengan information architecture.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.

### Completion Note

Completed on 2026-05-30. FE-07 adds reusable frontend TypeScript contracts, route/label/navigation constants, and synthetic Spotify review mock data for UI development. AHP and Fuzzy AHP data remain prototype-ready and data-driven, with no frontend calculation implementation.

### Final Decision

Mock-first frontend data foundation selected:

```txt
TypeScript contracts + constants + synthetic UI mock data
```

Implementation scope:

```txt
No layout, dashboard UI, core pages, or FE-08 implementation was started.
```

---

## FE-08 — Layout Utama

### Objective

Membuat foundation layout utama SentiRank menggunakan reusable dashboard app shell dengan sidebar, topbar, dan main content area yang siap dipakai oleh halaman-halaman frontend berikutnya.

### Task Checklist

- [x] Buat `frontend/components/layout/AppShell.tsx`.
- [x] Buat `frontend/components/layout/AppSidebar.tsx`.
- [x] Buat `frontend/components/layout/AppTopbar.tsx`.
- [x] Buat `frontend/components/layout/PageHeader.tsx`.
- [x] Buat mobile navigation foundation melalui `frontend/components/layout/MobileSidebar.tsx`.
- [x] Buat barrel export `frontend/components/layout/index.ts`.
- [x] Update `frontend/app/layout.tsx` agar memakai `AppShell`.
- [x] Update `frontend/app/page.tsx` sebagai placeholder layout-only untuk route dashboard.
- [x] Gunakan navigation constants dari FE-07.
- [x] Siapkan active route handling pada sidebar.
- [x] Pastikan layout menggunakan Light Mode default dan arah `SentiRank Research Analytics Light`.
- [x] Pastikan main content area responsive.
- [x] Pastikan `PageHeader` mendukung title, description, eyebrow, dan optional action slot.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.
- [x] Tidak mengimplementasikan full dashboard content.
- [x] Tidak membuat core pages.
- [x] Tidak membuat AHP/Fuzzy AHP prototype.
- [x] Tidak memulai FE-09 atau fase setelahnya.

### Acceptance Criteria

- [x] Layout menggunakan NextJS App Router.
- [x] Layout menggunakan TypeScript.
- [x] Layout menggunakan Tailwind CSS.
- [x] Sidebar menampilkan primary navigation items dari existing navigation constants.
- [x] Active route handling tersedia pada sidebar dan mobile navigation.
- [x] Layout memakai struktur sidebar + topbar + main content area.
- [x] `AppShell` reusable untuk halaman dashboard berikutnya.
- [x] `PageHeader` reusable dan mendukung title, description, dan optional action slot.
- [x] Main content area responsive.
- [x] Default theme tetap Light Mode.
- [x] `frontend/DESIGN.md` tetap dipertahankan.
- [x] FE-07 types, constants, dan mock data tetap dipertahankan.
- [x] Tidak ada dependency baru.
- [x] Tidak ada dashboard metrics, core page implementation, atau AHP/Fuzzy AHP prototype.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.

### Completion Note

Completed on 2026-05-30. FE-08 implements the reusable SentiRank dashboard layout foundation with `AppShell`, `AppSidebar`, `AppTopbar`, `PageHeader`, and mobile navigation support. The root app now uses sidebar, topbar, and responsive main content structure without adding dashboard metrics, core pages, or AHP/Fuzzy AHP prototype logic.

### Final Decision

Main layout selected:

```txt
Sidebar + topbar + responsive main content app shell
```

Implementation scope:

```txt
Layout foundation only. FE-09 dashboard content and later page implementations remain not started.
```

---

## FE-09 — Dashboard

### Objective

Mengimplementasikan halaman dashboard utama SentiRank menggunakan layout FE-08, mock data FE-07, dan komponen reusable untuk summary cards, charts, ranking preview, model metrics, review table, badge, dan recommendation summary.

### Task Checklist

- [x] Buat `frontend/components/cards/StatCard.tsx`.
- [x] Buat `frontend/components/cards/ChartCard.tsx`.
- [x] Buat `frontend/components/cards/RankingCard.tsx`.
- [x] Buat `frontend/components/cards/ModelMetricCard.tsx`.
- [x] Buat `frontend/components/charts/SentimentDistributionChart.tsx`.
- [x] Buat `frontend/components/charts/AspectRankingChart.tsx`.
- [x] Buat `frontend/components/charts/AhpRankingComparisonChart.tsx`.
- [x] Buat `frontend/components/tables/ReviewTable.tsx`.
- [x] Buat `frontend/components/badges/SentimentBadge.tsx`.
- [x] Buat `frontend/components/badges/AspectBadge.tsx`.
- [x] Update `frontend/app/page.tsx` sebagai dashboard page.
- [x] Tampilkan page header.
- [x] Tampilkan summary cards: Total Reviews, Positive Reviews, Neutral Reviews, Negative Reviews, Top Negative Aspect, dan Priority Score.
- [x] Tampilkan sentiment distribution chart.
- [x] Tampilkan negative aspect ranking chart.
- [x] Tampilkan AHP/Fuzzy AHP priority preview.
- [x] Tampilkan model performance summary.
- [x] Tampilkan latest negative reviews table.
- [x] Tampilkan short recommendation/insight summary.
- [x] Gunakan FE-07 mock data.
- [x] Pastikan komponen reusable dan memakai TypeScript props.
- [x] Pastikan empty state tersedia pada chart, ranking, dan table yang relevan.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.
- [x] Tidak membuat Dataset, Sentiment, Aspect, AHP/Fuzzy AHP, Evaluation, Reports, atau Settings pages.
- [x] Tidak membuat real API calls.
- [x] Tidak mengimplementasikan kalkulasi AHP/Fuzzy AHP di frontend.
- [x] Tidak memulai FE-10 atau fase setelahnya.

### Acceptance Criteria

- [x] Dashboard mengikuti `SentiRank Research Analytics Light`.
- [x] Dashboard menggunakan Light Mode default.
- [x] Dashboard tampil sebagai clean academic analytics dashboard.
- [x] Dashboard menggunakan white cards, slate/off-white background, dan blue accent.
- [x] Dashboard memiliki readable table dan minimal charts.
- [x] Dashboard responsif untuk layar laptop.
- [x] Semua required dashboard sections tersedia.
- [x] Data dashboard berasal dari FE-07 mock data.
- [x] Dashboard tetap API-contract-ready.
- [x] Tidak ada data dashboard reusable yang di-hardcode langsung di komponen.
- [x] Tidak ada real API call.
- [x] Tidak ada kalkulasi AHP/Fuzzy AHP aktual di frontend.
- [x] Komponen dashboard reusable dan memakai TypeScript props.
- [x] Recharts digunakan untuk chart dashboard.
- [x] Tidak ada dependency baru.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.

### Completion Note

Completed on 2026-05-30. FE-09 implements the main SentiRank dashboard page with reusable cards, charts, badges, review table, model metric summary, AHP/Fuzzy AHP priority preview, and recommendation summary using FE-07 mock data only. No FE-10 pages, real API calls, or frontend AHP/Fuzzy AHP calculations were added.

### Final Decision

Dashboard implementation selected:

```txt
Mock-data-driven research analytics dashboard
```

Implementation scope:

```txt
Dashboard route only. Core pages and later phase implementations remain not started.
```

---

## FE-10 — Core Pages

### Objective

Mengimplementasikan halaman core SentiRank setelah dashboard menggunakan layout reusable FE-08, komponen FE-09, mock data FE-07, dan copy UI Bahasa Indonesia tanpa memulai implementasi penuh AHP/Fuzzy AHP.

### Task Checklist

- [x] Buat `frontend/app/dataset/page.tsx`.
- [x] Buat `frontend/app/scraping/page.tsx`.
- [x] Buat `frontend/app/preprocessing/page.tsx`.
- [x] Buat `frontend/app/sentiment-analysis/page.tsx`.
- [x] Buat `frontend/app/aspect-classification/page.tsx`.
- [x] Buat `frontend/app/model-evaluation/page.tsx`.
- [x] Buat `frontend/app/reports/page.tsx`.
- [x] Buat `frontend/app/settings/page.tsx`.
- [x] Buat placeholder sederhana `frontend/app/ahp-fuzzy-ahp/page.tsx` untuk route navigasi tanpa implementasi penuh FE-11.
- [x] Gunakan `AppShell`, `AppSidebar`, `AppTopbar`, `PageHeader`, dan mobile navigation yang sudah tersedia.
- [x] Gunakan reusable `StatCard`, `ChartCard`, `RankingCard`, `ModelMetricCard`, `ReviewTable`, badge, dan chart yang sudah tersedia.
- [x] Tambahkan reusable `SummaryCard` dan `SimpleTable` untuk menghindari duplikasi markup kartu/tabel.
- [x] Tambahkan mock metadata kecil untuk dataset, scraping, preprocessing, sentiment result, aspect result, model evaluation overview, dan settings di `frontend/lib/mock-data.ts`.
- [x] Pastikan UI copy menggunakan Bahasa Indonesia formal dan nama metode tetap IndoBERT, SVM, AHP, Fuzzy AHP, dan API.
- [x] Pastikan semua halaman tetap mock-first dan API-contract-ready.
- [x] Pastikan tidak ada real API call.
- [x] Pastikan tidak ada kalkulasi AHP/Fuzzy AHP aktual di frontend.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.
- [x] Tidak memulai FE-11.
- [x] Tidak memulai FE-12.

### Acceptance Criteria

- [x] Route `/dataset` menampilkan ringkasan dataset, kualitas data, distribusi rating/label, dan tabel ulasan.
- [x] Route `/scraping` menampilkan status scraping mock, ringkasan batch, parameter mock, dan preview ulasan mentah tanpa real scraping call.
- [x] Route `/preprocessing` menampilkan ringkasan pipeline, before/after text sample, dan data diproses untuk demo skripsi.
- [x] Route `/sentiment-analysis` menampilkan input ulasan tunggal mock, hasil prediksi mock, distribusi sentimen, dan tabel hasil sentimen tanpa real inference.
- [x] Route `/aspect-classification` menampilkan summary aspek, ranking/frekuensi aspek, grouping ulasan negatif, dan tabel hasil aspek tanpa real inference.
- [x] Route `/model-evaluation` menampilkan kartu accuracy/precision/recall/F1, confusion matrix, tabel evaluasi, dan catatan perbandingan model.
- [x] Route `/reports` menampilkan research summary, sentiment summary, aspect summary, recommendation summary placeholder, dan tombol export disabled/mock.
- [x] Route `/settings` menampilkan metadata aplikasi, placeholder endpoint API, metadata model, informasi tema, dan status sistem mock.
- [x] Route `/ahp-fuzzy-ahp` hanya berisi placeholder FE-11 dan tidak mengimplementasikan prototype penuh.
- [x] Dashboard tetap berada di `/dashboard`.
- [x] Landing page tetap berada di `/`.
- [x] Sidebar dan mobile navigation tetap memakai route constants dan link ke halaman core dengan benar.
- [x] Semua halaman memakai Light Mode default dan arah `SentiRank Research Analytics Light`.
- [x] Semua halaman memakai white cards, slate/off-white background, blue accent, readable tables, dan charts minimal.
- [x] Semua halaman menggunakan mock data FE-07 atau mock metadata kecil di `frontend/lib/mock-data.ts`.
- [x] Tidak ada hardcode dataset besar langsung di page components.
- [x] Tidak ada dependency baru.
- [x] Tidak ada real API call.
- [x] Tidak ada kalkulasi AHP/Fuzzy AHP aktual di frontend.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.

### Completion Note

Completed on 2026-06-02. FE-10 implements the SentiRank core pages for Dataset, Scraping, Preprocessing, Sentiment Analysis, Aspect Classification, Model Evaluation, Reports, and Settings using existing layout/components and mock data. `/ahp-fuzzy-ahp` is intentionally limited to a FE-11 placeholder. No real API calls, new dependencies, or frontend AHP/Fuzzy AHP calculations were added.

### Final Decision

Core pages implementation selected:

```txt
Mock-first Bahasa Indonesia core pages using reusable dashboard components
```

Implementation scope:

```txt
Core page routes only. Full AHP/Fuzzy AHP prototype remains deferred to FE-11, and API integration remains deferred to FE-12.
```

---

## FE-11 — AHP/Fuzzy AHP Prototype

### Objective

Mengimplementasikan halaman prototype AHP/Fuzzy AHP yang fleksibel, data-driven, mock-first, dan siap diarahkan ke backend calculation service tanpa melakukan kalkulasi metode final di frontend.

### Task Checklist

- [x] Update `frontend/app/ahp-fuzzy-ahp/page.tsx` dari placeholder FE-10 menjadi prototype penuh.
- [x] Tampilkan page header.
- [x] Tampilkan method overview card.
- [x] Tampilkan criteria setup preview.
- [x] Tampilkan expert judgement / pairwise comparison preview.
- [x] Tampilkan AHP pairwise comparison matrix.
- [x] Tampilkan Consistency Ratio card.
- [x] Tampilkan AHP weight result.
- [x] Tampilkan Fuzzy AHP weight result.
- [x] Tampilkan AHP vs Fuzzy AHP ranking comparison chart.
- [x] Tampilkan final recommendation summary.
- [x] Tampilkan method limitation / prototype note.
- [x] Buat `frontend/components/tables/MatrixTable.tsx`.
- [x] Buat `frontend/components/cards/RecommendationCard.tsx`.
- [x] Buat `frontend/components/badges/ConsistencyBadge.tsx`.
- [x] Buat `frontend/components/forms/PairwiseComparisonInput.tsx`.
- [x] Buat `frontend/components/forms/CriteriaEditor.tsx`.
- [x] Gunakan existing `RankingCard` dan `AhpRankingComparisonChart`.
- [x] Gunakan mock data FE-07 dari `frontend/lib/mock-data.ts`.
- [x] Pastikan UI copy menggunakan Bahasa Indonesia dan nama metode tetap AHP, Fuzzy AHP, TFN, dan Consistency Ratio.
- [x] Pastikan page tetap fleksibel dan tidak hardcode final criteria count.
- [x] Pastikan tidak mengunci final expert judgement scale atau mapping TFN.
- [x] Pastikan tidak ada real API call.
- [x] Pastikan tidak ada real AHP/Fuzzy AHP calculation di frontend.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.
- [x] Tidak memulai FE-12.

### Acceptance Criteria

- [x] `frontend/app/ahp-fuzzy-ahp/page.tsx` menampilkan prototype AHP/Fuzzy AHP lengkap.
- [x] Semua required page sections tersedia.
- [x] Criteria preview menggunakan data `AhpCriterion` secara dinamis.
- [x] Pairwise preview menggunakan data `PairwiseComparison` secara dinamis.
- [x] Matrix table readable, responsif, dan tidak mengunci jumlah kriteria final.
- [x] Consistency Ratio ditampilkan sebagai status mock/prototype.
- [x] AHP weight result dan Fuzzy AHP weight result ditampilkan jelas.
- [x] Ranking comparison chart membandingkan AHP dan Fuzzy AHP.
- [x] Recommendation summary mudah dipahami untuk demo skripsi.
- [x] Method limitation note menyatakan nilai masih mock/prototype sampai backend calculation service terintegrasi.
- [x] Komponen baru memakai TypeScript props dan empty state jika relevan.
- [x] Page mengikuti `SentiRank Research Analytics Light`.
- [x] Page menggunakan Light Mode default, white cards, slate/off-white background, blue accent, readable tables, dan charts minimal.
- [x] Page menggunakan Bahasa Indonesia untuk UI copy.
- [x] Tidak ada real API call.
- [x] Tidak ada kalkulasi AHP/Fuzzy AHP aktual di frontend.
- [x] Tidak ada dependency baru.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.

### Completion Note

Completed on 2026-06-02. FE-11 implements the AHP/Fuzzy AHP prototype page with dynamic criteria preview, pairwise judgement preview, readable matrix table, Consistency Ratio status, AHP and Fuzzy AHP ranking outputs, comparison chart, final recommendation summary, and explicit prototype limitation notes. The page uses existing mock data only, adds no real API calls, and performs no frontend AHP/Fuzzy AHP calculation.

### Final Decision

AHP/Fuzzy AHP prototype implementation selected:

```txt
Mock-data-driven frontend prototype with dynamic criteria, matrix, ranking, comparison, and recommendation UI
```

Implementation scope:

```txt
Prototype visualization only. Backend calculation service and API integration remain deferred to FE-12.
```

---

## FE-12 — API Integration Preparation

### Objective

Menyiapkan frontend SentiRank agar siap diintegrasikan dengan backend/FastAPI melalui HTTP client, endpoint constants, service layer, environment variable, dan dokumentasi integrasi tanpa mengubah halaman yang masih mock-first.

### Task Checklist

- [x] Buat `frontend/lib/http-client.ts`.
- [x] Buat `frontend/lib/api.ts`.
- [x] Buat `frontend/lib/api-endpoints.ts`.
- [x] Buat `frontend/.env.example` dengan `NEXT_PUBLIC_API_BASE_URL`.
- [x] Update `frontend/types/api.ts` dengan request/query/helper types dan DTO summary ringan.
- [x] Update `frontend/types/index.ts` agar tipe API baru diekspor.
- [x] Buat `frontend/services/review-service.ts`.
- [x] Buat `frontend/services/dataset-service.ts`.
- [x] Buat `frontend/services/scraping-service.ts`.
- [x] Buat `frontend/services/preprocessing-service.ts`.
- [x] Buat `frontend/services/sentiment-service.ts`.
- [x] Buat `frontend/services/aspect-service.ts`.
- [x] Buat `frontend/services/ahp-service.ts`.
- [x] Buat `frontend/services/fuzzy-ahp-service.ts`.
- [x] Buat `frontend/services/evaluation-service.ts`.
- [x] Buat `frontend/services/report-service.ts`.
- [x] Tambahkan TODO comments pada service layer untuk koneksi endpoint backend final.
- [x] Buat `docs/frontend/api-integration-plan.md`.
- [x] Pastikan halaman tetap menggunakan mock data dan belum memanggil service API.
- [x] Pastikan tidak ada real API call di pages.
- [x] Pastikan tidak ada kalkulasi AHP/Fuzzy AHP di frontend.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.

### Acceptance Criteria

- [x] API base URL disiapkan melalui `NEXT_PUBLIC_API_BASE_URL`.
- [x] Reusable HTTP client wrapper tersedia.
- [x] Endpoint constants tersedia untuk Review, Dataset, Scraping, Preprocessing, Sentiment, Aspect, AHP, Fuzzy AHP, Model Evaluation, dan Report API.
- [x] Service functions tersedia dan mengembalikan typed promises.
- [x] `getReviews(query?)` tersedia.
- [x] `getDatasetSummary()` tersedia.
- [x] `getScrapingSummary()` tersedia.
- [x] `getPreprocessingSummary()` tersedia.
- [x] `predictSentiment(input)` dan `getSentimentSummary()` tersedia.
- [x] `classifyAspect(input)` dan `getAspectSummary()` tersedia.
- [x] `calculateAhp(input)` tersedia.
- [x] `calculateFuzzyAhp(input)` tersedia.
- [x] `getEvaluationSummary()` tersedia.
- [x] `getReportSummary()` tersedia.
- [x] Current mock-first UI behavior tetap utuh.
- [x] Existing dashboard, core pages, dan AHP/Fuzzy AHP prototype tidak diganti ke real API.
- [x] Tidak ada backend atau ml-service file yang dimodifikasi.
- [x] Tidak ada root-level legacy NextJS file di luar `frontend/` yang dimodifikasi.
- [x] `docs/frontend/api-integration-plan.md` mencakup purpose, strategy, env usage, endpoint groups, service layer, data flow, migration plan, error/loading handling, security notes, dan FE-12 acceptance criteria.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.

### Completion Note

Completed on 2026-06-02. FE-12 prepares frontend API integration with typed endpoint constants, reusable HTTP client, service modules for all planned API groups, `.env.example`, and `docs/frontend/api-integration-plan.md`. Existing pages remain mock-first, services are not wired into UI yet, and no frontend AHP/Fuzzy AHP calculation or backend integration was added.

### Final Decision

API integration preparation selected:

```txt
Typed service-layer API preparation without replacing mock-first pages
```

Implementation scope:

```txt
Contracts and service functions only. Real backend integration and page migration remain future work.
```

---

## MS-10 — Frontend Gateway Integration

### Objective

Menghubungkan frontend SentiRank ke `api-gateway-service` sebagai satu-satunya entry point API tanpa memanggil internal microservice ports secara langsung.

### Task Checklist

- [x] Pastikan `frontend/.env.example` menggunakan `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
- [x] Ubah endpoint constants dari placeholder `/api/*` ke public Gateway routes.
- [x] Tambahkan helper unwrap response envelope Gateway di HTTP client.
- [x] Update service layer agar membaca payload `data` dari Gateway response.
- [x] Tambahkan health service untuk `/health` dan `/health/services`.
- [x] Tambahkan panel demo API Gateway pada halaman AHP/Fuzzy AHP.
- [x] Pertahankan warning sample development judgement.
- [x] Pastikan tidak ada kalkulasi AHP/Fuzzy AHP di frontend.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.

### Acceptance Criteria

- [x] Frontend memakai `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
- [x] Frontend tidak memakai internal service URL atau port `8001` sampai `8005`.
- [x] AHP/Fuzzy AHP demo memanggil `/ahp/criteria`, `/ahp/calculate`, `/ahp/fuzzy-calculate`, dan `/ahp/compare` melalui Gateway.
- [x] Jika Gateway offline, UI menampilkan pesan `API Gateway belum aktif. Jalankan microservice backend terlebih dahulu.`
- [x] Tidak ada perubahan Prisma, model, scraping, preprocessing, raw/processed dataset, atau legacy `ml-service`.

### Completion Note

Completed on 2026-06-05. MS-10 updates the frontend API client, endpoint constants, services, and AHP/Fuzzy AHP page integration so browser-facing calls use `api-gateway-service` only. Existing mock UI remains available, while the AHP/Fuzzy AHP page now has a Gateway-backed sample demo panel that does not calculate AHP/Fuzzy AHP in the frontend.

---

## MS-10B — Frontend Gateway Failure Fallback Cleanup

### Objective

Membersihkan perilaku fallback agar halaman yang sudah memakai API Gateway tidak menampilkan nilai mock ketika Gateway gagal atau belum aktif.

### Task Checklist

- [x] Normalisasi error Gateway menjadi `source=api-gateway`, `status=unavailable`.
- [x] Tambahkan red alert untuk pesan `API Gateway belum aktif. Jalankan microservice backend terlebih dahulu.`
- [x] Ubah Dashboard ke zero/empty state ketika Gateway gagal.
- [x] Ubah Dataset, Scraping, dan Preprocessing ke zero/empty state ketika Gateway gagal.
- [x] Ubah Sentiment, Aspect, Evaluation, dan Report ke zero/empty state ketika Gateway gagal.
- [x] Bersihkan halaman AHP/Fuzzy AHP dari output mock aktif.
- [x] Pertahankan sample-development warning hanya ketika data sample AHP/Fuzzy AHP tersedia.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.

### Acceptance Criteria

- [x] Tidak ada halaman gateway-backed yang memakai mock data sebagai fallback produksi/demo.
- [x] Jika API Gateway mati, angka menjadi `0`, tabel/chart kosong, dan alert merah muncul.
- [x] Jika API Gateway aktif, halaman menggunakan data dari response envelope Gateway.
- [x] Frontend tetap tidak memanggil internal service port secara langsung.
- [x] Frontend tetap tidak menghitung AHP/Fuzzy AHP.

### Completion Note

Completed on 2026-06-05 and revalidated on 2026-06-17. MS-10B changes gateway-backed pages from mock fallback to explicit zero/empty fallback with a red API Gateway unavailable alert. Dashboard and AHP/Fuzzy AHP now carry normalized Gateway errors into the UI; AHP/Fuzzy AHP remains read-only, hides sample warning when Gateway is unavailable, and uses `0`, `-`, empty tables, and empty charts instead of mock output. Legacy mock data remains only as design/reference data, not as fallback for dashboard/demo output.

---

## MS-10C - Data Source Policy and Service Ownership Documentation

### Objective

Mendokumentasikan batas data source SentiRank pada arsitektur microservice tahap skripsi: artifact CSV/JSON/model tetap sah sebagai output penelitian read-only, sedangkan database digunakan untuk data runtime user inference history.

### Task Checklist

- [x] Audit dokumentasi arsitektur lama yang masih menyiratkan Next.js API + SQLite/Prisma sebagai desain utama.
- [x] Audit service yang membaca artifact CSV/JSON.
- [x] Audit apakah frontend hanya memanggil API Gateway.
- [x] Dokumentasikan research artifact path dan runtime database path.
- [x] Dokumentasikan service ownership untuk review, sentiment, aspect, decision, report, api-gateway, dan database service.
- [x] Dokumentasikan acceptable file-based runtime reads.
- [x] Dokumentasikan future work database dan domain ownership.
- [x] Update dokumentasi frontend yang relevan.
- [x] Tidak mengubah schema database, Docker Compose, backend logic, frontend UI, dataset, model, preprocessing, atau AHP/Fuzzy AHP calculation.

### Acceptance Criteria

- [x] Policy menyatakan CSV/JSON/model artifact boleh dipakai sebagai reproducible research outputs.
- [x] Policy menyatakan artifact runtime service bersifat read-only dan bukan live user runtime data.
- [x] Policy menyatakan database digunakan untuk user-submitted inference history dan metadata prediksi.
- [x] Policy menyatakan frontend hanya boleh membaca data dari API Gateway melalui `NEXT_PUBLIC_API_BASE_URL`.
- [x] Policy menyatakan frontend tidak boleh membaca CSV/JSON langsung, memanggil internal service port, atau menghitung AHP/Fuzzy AHP.
- [x] Ownership setiap service terdokumentasi.
- [x] Risiko shared `datasets/` artifact folder tercatat sebagai batasan thesis-stage.
- [x] Tidak ada build/test runtime yang diperlukan karena perubahan hanya dokumentasi.

### Completion Note

Completed on 2026-06-17. MS-10C clarifies the data source policy in `docs/microservices/architecture.md`, updates project-level architecture notes in `README.md` and `CLAUDE.md`, and records frontend-facing data access constraints in `frontend/DESIGN.md` plus this tracker. Current audit found that `review-service`, `sentiment-service`, `aspect-service`, and `report-service` read CSV/JSON research artifacts behind service boundaries; `decision-service` owns calculation behavior without reading research CSV/JSON; `api-gateway-service` proxies service responses; and frontend service modules call only Gateway routes.

---

## MS-10D - Frontend Table Alignment by Pipeline Stage

### Objective

Menyelaraskan header, mapping kolom, dan empty state tabel frontend agar setiap halaman gateway-backed merepresentasikan tahap pipeline penelitian yang tepat.

### Task Checklist

- [x] Audit tabel Dashboard, Dataset, Scraping, Prapemrosesan, Analisis Sentimen, Klasifikasi Aspek, Evaluasi Model, dan route rekomendasi yang tersedia.
- [x] Ubah empty state `SimpleTable` agar pesan kosong tampil di dalam struktur tabel.
- [x] Selaraskan tabel Dashboard untuk hasil review terproses dan rekomendasi prioritas.
- [x] Selaraskan tabel Dataset untuk record review mentah.
- [x] Selaraskan tabel Scraping untuk preview hasil pengumpulan data.
- [x] Selaraskan tabel Prapemrosesan untuk before/after cleaning dan status kualitas.
- [x] Selaraskan tabel Analisis Sentimen untuk sampel prediksi/evaluasi sentimen.
- [x] Selaraskan tabel Klasifikasi Aspek untuk sampel hasil klasifikasi aspek.
- [x] Selaraskan tabel Evaluasi Model untuk metrik performa model.
- [x] Pertahankan fallback MS-10B: Gateway unavailable menampilkan red alert, nilai zero/empty, dan tabel kosong.
- [x] Tidak mengubah backend, API Gateway, Docker Compose, schema database, dataset, training script, preprocessing script, atau kalkulasi AHP/Fuzzy AHP.
- [x] Jalankan `npm run lint`.
- [x] Jalankan `npm run build`.

### Acceptance Criteria

- [x] Tabel gateway-backed memakai kolom sesuai tahap pipeline, bukan tabel review generik.
- [x] Tabel kosong saat API Gateway unavailable dan tidak menampilkan mock/stale rows.
- [x] Field yang tidak tersedia ditampilkan sebagai `-` atau pesan empty state, bukan `undefined`, `null`, atau `NaN`.
- [x] Tabel lebar tetap mendukung horizontal scroll.
- [x] Review text panjang memakai truncation/wrapping agar layout tidak rusak.
- [x] Frontend tetap hanya memanggil API Gateway melalui service layer.
- [x] Halaman AHP/Fuzzy AHP tidak dimodifikasi.
- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.

### Completion Note

Completed on 2026-06-17. MS-10D aligns frontend table columns by research pipeline stage, converts `SimpleTable` empty state into an in-table message row, keeps gateway-backed pages on API Gateway data only, and preserves MS-10B zero/empty fallback behavior when Gateway is unavailable.

---

## MS-11 — Dashboard Finalisasi Penelitian

### Objective

Menjadikan Dashboard sebagai ringkasan final penelitian SentiRank yang membaca data terstruktur dari service backend, tanpa copy demo/developer-facing, dan tanpa kalkulasi ulang AHP/Fuzzy AHP di frontend.

### Task Checklist

- [x] Tambahkan endpoint read-only `GET /reports/ranking-comparison` dengan source priority CSV final lalu CSV current.
- [x] Tambahkan proxy route `GET /reports/ranking-comparison` di API Gateway.
- [x] Tambahkan distribusi aspek negatif final pada aspect summary.
- [x] Tambahkan endpoint latest negative reviews dengan `aspect_label`.
- [x] Tambahkan adapter dashboard `getDashboardSummary()`, `getSentimentStageComparison()`, `getTopAspects()`, `getEvaluationSummary()`, dan `getRankingComparison()`.
- [x] Ubah Dashboard menjadi layout final: dataset cards, model metrics, sentiment stage bar chart, top 5 aspek negatif, comparison chart, ranking table, dan ulasan negatif terbaru.
- [x] Hapus section Ringkasan Rekomendasi dari Dashboard.
- [x] Hapus menu Laporan dan redirect `/reports` ke `/dashboard`.
- [x] Bersihkan visible copy developer-facing dari Dashboard, sidebar, reports route, dan halaman reachable utama.
- [x] Jalankan lint, typecheck, build, dan targeted backend tests.

### Acceptance Criteria

- [x] Dashboard tidak lagi menampilkan card positif/netral/negatif di top row.
- [x] Ringkasan Dataset berisi maksimal 6 card sesuai pipeline penelitian.
- [x] Ringkasan Performa Model berada di row kedua dan tidak menampilkan nama run.
- [x] Distribusi sentimen tampil sebagai bar chart per tahap.
- [x] Top aspek hanya menampilkan 5 aspek negatif final.
- [x] AHP/Fuzzy AHP full width dan membaca ranking comparison dari CSV backend.
- [x] Ranking Prioritas full width dan berbentuk tabel.
- [x] Ringkasan Rekomendasi Dashboard sudah hilang.
- [x] Menu Laporan sudah hilang dan `/reports` redirect ke Dashboard.
- [x] Visible UI Dashboard/sidebar/reports tidak menampilkan Preview, Demo, Sample, mock-first, fallback, gateway, atau API Gateway.
- [x] Validasi lint/typecheck/build/backend tests selesai.

### Completion Note

Completed on 2026-06-05. Dashboard finalisasi penelitian selesai dengan backend CSV ranking endpoint, dashboard adapter, layout final data-backed, Reports redirect, UI copy cleanup, dan validasi lint/typecheck/build serta targeted backend tests per service.

---

## MS-12 - AHP/Fuzzy AHP Results Page Cleanup

### Objective

Mengubah halaman `/ahp-fuzzy-ahp` dari panel demo kalkulasi menjadi halaman hasil analisis prioritas yang read-only, user friendly, dan tetap data-backed melalui API Gateway.

### Task Checklist

- [x] Hapus pemakaian panel demo kalkulasi dari halaman utama AHP/Fuzzy AHP.
- [x] Tambahkan adapter frontend read-only untuk kriteria, status sample, dan ranking comparison.
- [x] Tampilkan alert sample sebelum judul halaman.
- [x] Tampilkan ringkasan prioritas, criteria overview, hasil AHP, hasil Fuzzy AHP, comparison, ranking prioritas, dan rekomendasi singkat.
- [x] Gunakan empty/error state user friendly ketika layanan analisis belum tersedia.
- [x] Pastikan halaman tidak menampilkan stack trace, path file, endpoint teknis, atau metadata developer-facing.
- [x] Pastikan tidak ada tombol `Jalankan Perhitungan`, `Run Sample Calculation`, `Hitung AHP`, atau tombol kalkulasi sejenis.
- [x] Pastikan frontend tetap tidak menghitung AHP/Fuzzy AHP.
- [x] Catat keputusan desain/integrasi di dokumentasi frontend.
- [x] Jalankan lint, typecheck, dan build.

### Acceptance Criteria

- [x] `/ahp-fuzzy-ahp` menjadi halaman hasil, bukan kalkulator interaktif.
- [x] Data AHP/Fuzzy AHP dibaca melalui service layer frontend yang memanggil API Gateway.
- [x] Jika data berstatus sample, alert sample tampil jelas dan tidak memakai label final.
- [x] Jika layanan belum tersedia, halaman menampilkan pesan kosong yang mudah dipahami.
- [x] Tabel tetap responsif dengan horizontal scroll untuk kolom lebar.
- [x] UI copy menggunakan Bahasa Indonesia natural untuk pengguna non-teknis.
- [x] Tidak ada perubahan engine AHP, engine Fuzzy AHP, dataset, model, docker-compose, database schema, atau preprocessing.

### Completion Note

Completed on 2026-06-17. Halaman AHP/Fuzzy AHP sekarang memakai adapter `getAhpFuzzyAhpOverview()` untuk membaca `GET /ahp/criteria`, `GET /evaluation/summary`, dan `GET /reports/ranking-comparison` melalui service layer. Halaman tidak lagi menampilkan panel demo kalkulasi, tidak menjalankan POST kalkulasi dari frontend, dan menampilkan status sample serta empty state secara eksplisit.

---

## MS-13C - Frontend Reports Route Cleanup

### Objective

Menghapus sisa route frontend Reports yang tidak lagi menjadi bagian scope demo skripsi, sambil mempertahankan Dashboard sebagai permukaan ringkasan utama dan menjaga semua akses data tetap melalui API Gateway.

### Task Checklist

- [x] Hapus route frontend `/reports` yang sebelumnya hanya redirect ke Dashboard.
- [x] Hapus konstanta route Reports yang tidak lagi dipakai navigasi.
- [x] Hapus adapter `getReportSummary()` yang tidak dipakai halaman aktif.
- [x] Pertahankan `frontend/services/report-service.ts` untuk `getRankingComparison()` karena Dashboard dan AHP/Fuzzy AHP masih membaca `/reports/ranking-comparison` melalui API Gateway.
- [x] Pastikan backend `report-service`, API Gateway report routes, Docker Compose, dataset, model, Prisma, dan AHP/Fuzzy AHP tidak diubah.

### Acceptance Criteria

- [x] Sidebar tidak memiliki item Reports/Laporan.
- [x] Route page-level `/reports` sudah tidak ada di frontend.
- [x] Tidak ada tombol `Cetak Laporan` atau `Print Report` pada UI yang diaudit.
- [x] Dashboard tetap memakai service layer API Gateway dan tidak memanggil service internal secara langsung.
- [x] Backend report-service tidak dihapus pada milestone ini.

### Completion Note

Completed on 2026-06-19. Frontend Reports page dihapus karena hanya redirect ke Dashboard dan tidak reachable dari navigasi. Dashboard tetap menjadi permukaan summary/reporting untuk demo skripsi, fitur print report di luar scope saat ini, dan backend report-service/API Gateway report route tetap disisakan untuk audit dependensi terpisah.
