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
- [ ] FE-11 — AHP/Fuzzy AHP prototype selesai
- [ ] FE-12 — API integration preparation selesai

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
