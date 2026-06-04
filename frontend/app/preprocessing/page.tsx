import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { researchResults } from "@/lib/research-results";

export default function PreprocessingPage() {
  return (
    <AppShell>
      <PageHeader
        description="Menjelaskan pipeline relabeling, pembersihan teks, dan weak aspect labeling sebelum data digunakan oleh IndoBERT dan SVM."
        eyebrow="Persiapan teks"
        title="Prapemrosesan"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Jumlah ulasan sebelum pipeline teks."
          label="Ulasan Mentah"
          value={researchResults.preprocessingSummary.totalRows.toLocaleString("id-ID")}
        />
        <StatCard
          description="Baris dengan teks IndoBERT tersedia."
          label="Ulasan Diproses"
          tone="positive"
          value={researchResults.preprocessingSummary.totalRows.toLocaleString("id-ID")}
        />
        <StatCard
          description="Label berubah setelah audit rating 3."
          label="Relabeling"
          value={researchResults.preprocessingSummary.relabelingSummary.changedLabelCount.toLocaleString("id-ID")}
        />
        <StatCard
          description="Teks kosong untuk input IndoBERT."
          label="Kosong Setelah Cleaning"
          tone="positive"
          value={researchResults.preprocessingSummary.emptyTextIndobertCount}
        />
        <StatCard
          description="Baris dengan keyword match setelah refinement."
          label="Keyword Match"
          tone="primary"
          value={researchResults.preprocessingSummary.aspectLabelingSummary.rowsWithKeywordMatch.toLocaleString("id-ID")}
        />
        <StatCard
          description="Artefak prapemrosesan tersedia."
          label="Status Pipeline"
          tone="primary"
          value="Selesai"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ChartCard
          description="Urutan proses dibuat eksplisit agar transformasi data dapat dijelaskan saat demo skripsi."
          title="Ringkasan Tahap Pipeline"
        >
          <SimpleTable
            columns={[
              {
                key: "name",
                header: "Tahap",
                render: (row) => (
                  <span className="font-medium text-foreground">
                    {row.name}
                  </span>
                ),
              },
              {
                key: "description",
                header: "Penjelasan",
                render: (row) => row.description,
              },
              {
                key: "rowsAffected",
                header: "Baris",
                align: "right",
                render: (row) => row.rowsAffected,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    {row.status}
                  </span>
                ),
              },
            ]}
            data={researchResults.preprocessingSummary.preprocessingSteps}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>

        <SummaryCard
          description="Catatan ini membantu menjelaskan batas UI: frontend menampilkan output, bukan menjalankan pipeline ML."
          title="Ringkasan Proses"
        >
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {researchResults.preprocessingSummary.processedDataNotes.map((item) => (
              <li
                className="rounded-md border border-border bg-background px-4 py-3"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </SummaryCard>
      </section>

      <ChartCard
        description="Contoh before/after spesifik belum tersedia sebagai artefak ringkas frontend. Status ditampilkan eksplisit agar tidak mengarang sampel."
        title="Sampel Teks Sebelum / Sesudah"
      >
        <SimpleTable
          columns={[
            {
              key: "raw",
              header: "Teks Asli",
              className: "max-w-[420px]",
              render: (row) => (
                <p className="line-clamp-3 leading-6 text-foreground">
                  {row.rawText}
                </p>
              ),
            },
            {
              key: "cleaned",
              header: "Teks Bersih",
              className: "max-w-[420px]",
              render: (row) => (
                <p className="line-clamp-3 leading-6 text-muted-foreground">
                  {row.cleanedText}
                </p>
              ),
            },
            {
              key: "note",
              header: "Catatan",
              render: (row) => (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {row.note}
                </span>
              ),
            },
          ]}
          data={researchResults.preprocessingSummary.beforeAfterExamples}
          minWidthClassName="min-w-[840px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <ChartCard
        description="Ringkasan panjang teks sebelum dan sesudah cleaning dari artefak preprocessing."
        title="Ringkasan Data Diproses"
      >
        <SimpleTable
          columns={[
            {
              key: "stage",
              header: "Tahap",
              render: (row) => (
                <span className="font-medium text-foreground">
                  {row.stage}
                </span>
              ),
            },
            {
              key: "count",
              header: "Baris",
              align: "right",
              render: (row) => row.count.toLocaleString("id-ID"),
            },
            {
              key: "mean",
              header: "Rata-rata",
              align: "right",
              render: (row) => row.mean.toFixed(2),
            },
            {
              key: "median",
              header: "Median",
              align: "right",
              render: (row) => row.median,
            },
            {
              key: "max",
              header: "Maksimum",
              align: "right",
              render: (row) => row.max,
            },
          ]}
          data={researchResults.preprocessingSummary.textLengthBeforeAfter}
          minWidthClassName="min-w-[680px]"
          rowKey={(row) => row.stage}
        />
      </ChartCard>
    </AppShell>
  );
}
