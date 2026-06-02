import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import {
  mockModelEvaluation,
  mockSystemSettings,
} from "@/lib/mock-data";

const modelMetadata = mockModelEvaluation.models.map((model) => ({
  id: model.task,
  task: model.task === "sentiment" ? "Analisis Sentimen" : "Klasifikasi Aspek",
  modelName: model.modelName,
  modelVersion: model.modelVersion,
  sampleCount: model.sampleCount,
  status: "Mock tersedia",
}));

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        description="Metadata aplikasi, placeholder API, metadata model, informasi tema, dan status sistem mock untuk persiapan integrasi berikutnya."
        eyebrow="Konfigurasi"
        title="Pengaturan"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description={mockSystemSettings.app.environment}
          label="Aplikasi"
          tone="primary"
          value={mockSystemSettings.app.name}
        />
        <StatCard
          description="Versi package frontend."
          label="Versi"
          value={mockSystemSettings.app.version}
        />
        <StatCard
          description="Endpoint belum dipanggil dari UI."
          label="API"
          value="Placeholder"
        />
        <StatCard
          description="Default theme yang dipakai SentiRank."
          label="Tema"
          tone="primary"
          value={mockSystemSettings.theme.defaultTheme}
        />
        <StatCard
          description="Model mock tersedia untuk demo UI."
          label="Model"
          value={mockModelEvaluation.models.length}
        />
        <StatCard
          description="Integrasi backend disiapkan pada FE-12."
          label="Status Sistem"
          value="Mock-first"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <SummaryCard
          description="Informasi ini membantu evaluator memahami batas implementasi frontend saat ini."
          items={[
            {
              label: "Nama aplikasi",
              value: mockSystemSettings.app.name,
              description: mockSystemSettings.app.owner,
            },
            {
              label: "Environment",
              value: mockSystemSettings.app.environment,
              description: "Data berasal dari mock FE-07 dan FE-10.",
            },
            {
              label: "Visual direction",
              value: mockSystemSettings.theme.visualDirection,
              description: "Mengikuti frontend/DESIGN.md.",
            },
            {
              label: "Dark Mode",
              value: mockSystemSettings.theme.darkModeStatus,
              description: "Tidak ada theme switcher pada fase ini.",
            },
          ]}
          title="Metadata Aplikasi"
        />

        <ChartCard
          description="Daftar endpoint bersifat kontrak awal dan belum menjalankan real API call."
          title="Placeholder Endpoint API"
        >
          <SimpleTable
            columns={[
              {
                key: "service",
                header: "Layanan",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.service}
                  </span>
                ),
              },
              {
                key: "method",
                header: "Metode",
                render: (row) => row.method,
              },
              {
                key: "path",
                header: "Jalur",
                render: (row) => (
                  <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {row.path}
                  </code>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                    {row.status}
                  </span>
                ),
              },
            ]}
            data={mockSystemSettings.apiEndpoints}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>
      </section>

      <ChartCard
        description="Metadata model digunakan untuk menjelaskan sumber output mock dan kesiapan penggantian ke artefak final."
        title="Metadata Model"
      >
        <SimpleTable
          columns={[
            {
              key: "task",
              header: "Tugas",
              render: (row) => row.task,
            },
            {
              key: "model",
              header: "Model",
              render: (row) => (
                <div>
                  <p className="font-medium text-foreground">
                    {row.modelName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.modelVersion}
                  </p>
                </div>
              ),
            },
            {
              key: "sample",
              header: "Sampel Evaluasi",
              align: "right",
              render: (row) => row.sampleCount.toLocaleString("id-ID"),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {row.status}
                </span>
              ),
            },
          ]}
          data={modelMetadata}
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <SummaryCard
        description="Status ini menegaskan bahwa halaman FE-10 tetap mock-first dan API-contract-ready."
        title="Status Sistem Mock"
      >
        <div className="grid gap-3 md:grid-cols-3">
          {mockSystemSettings.systemStatus.map((status) => (
            <div
              className="rounded-md border border-border bg-background px-4 py-3"
              key={status.id}
            >
              <p className="text-sm font-semibold text-foreground">
                {status.label}
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {status.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {status.note}
              </p>
            </div>
          ))}
        </div>
      </SummaryCard>
    </AppShell>
  );
}
