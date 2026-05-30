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
- [ ] FE-04 — Wireframe selesai
- [ ] FE-05 — Component map selesai
- [ ] FE-06 — NextJS setup selesai
- [ ] FE-07 — Mock data dan types selesai
- [ ] FE-08 — Layout utama selesai
- [ ] FE-09 — Dashboard selesai
- [ ] FE-10 — Core pages selesai
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
