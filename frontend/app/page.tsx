import Link from "next/link";
import type { ReactElement } from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Cpu,
  Database,
  Layers3,
  ShieldCheck,
} from "lucide-react";

const methodologyItems = [
  {
    icon: Database,
    title: "Data Ulasan Spotify",
    description:
      "Ulasan pengguna menjadi sumber utama untuk melihat pola sentimen, keluhan, dan kebutuhan perbaikan produk.",
  },
  {
    icon: Layers3,
    title: "Prapemrosesan Teks",
    description:
      "Teks ulasan dipersiapkan untuk analisis melalui pembersihan, normalisasi, dan struktur data yang siap dipakai model.",
  },
  {
    icon: BrainCircuit,
    title: "Model Sentimen dan Aspek",
    description:
      "IndoBERT digunakan untuk sentimen, sementara klasifikasi aspek membantu membaca tema keluhan secara lebih terarah.",
  },
  {
    icon: BarChart3,
    title: "Prioritas AHP / Fuzzy AHP",
    description:
      "Aspek negatif diprioritaskan sebagai insight penelitian agar rekomendasi tidak berhenti pada hitungan sentimen saja.",
  },
];

const stackItems = ["NextJS", "TypeScript", "Tailwind CSS", "IndoBERT", "SVM"];

export default function HomePage(): ReactElement {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cpu aria-hidden="true" className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-normal">
            SentiRank
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a className="transition-colors hover:text-primary" href="#methodology">
            Cara Kerja
          </a>
          <a className="transition-colors hover:text-primary" href="#about">
            Tentang Data
          </a>
        </div>

        <Link
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/dashboard"
          prefetch={true}
        >
          Buka Dashboard
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center lg:pb-24 lg:pt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">
            Dashboard Analitik Penelitian
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            SentiRank
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Analisis sentimen, klasifikasi aspek, dan ranking prioritas
            AHP/Fuzzy AHP untuk analisis ulasan Spotify.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href="/dashboard"
              prefetch={true}
            >
              Buka Dashboard
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
              href="#methodology"
            >
              Pelajari Metodologi
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Alur Penelitian
            </p>
            <p className="mt-2 text-sm leading-6 text-blue-900">
              Dashboard dirancang untuk menunjukkan alur analisis dari data
              ulasan Spotify sampai prioritas insight berbasis AHP/Fuzzy AHP.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {[
              "Dataset ulasan Spotify",
              "Analisis sentimen",
              "Klasifikasi aspek",
              "Ranking prioritas",
            ].map((item, index) => (
              <div
                className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3"
                key={item}
              >
                <span className="text-sm font-medium text-foreground">
                  {item}
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-border bg-secondary/60 px-6 py-20"
        id="methodology"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              Metodologi
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
              Bagaimana SentiRank mengolah insight?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Landing page ini menjelaskan konteks sistem. Analisis lengkap
              tetap berada di dashboard agar presentasi skripsi fokus pada
              data, model, dan interpretasi hasil.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {methodologyItems.map((item) => (
              <article
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
                key={item.title}
              >
                <div className="flex size-11 items-center justify-center rounded-md bg-blue-50 text-primary">
                  <item.icon aria-hidden="true" className="size-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16" id="about">
        <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <ShieldCheck
            aria-hidden="true"
            className="mx-auto size-10 text-primary"
          />
          <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
            Keputusan berbasis data untuk pengalaman pengguna yang lebih baik
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            SentiRank menjaga tampilan tetap akademik, bersih, dan siap untuk
            demo skripsi dengan fokus pada keterbacaan hasil analitik.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {stackItems.map((item) => (
              <span
                className="rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        &copy; 2026 Ahmad Zaky Humami. Proyek tugas akhir Informatika.
      </footer>
    </main>
  );
}
