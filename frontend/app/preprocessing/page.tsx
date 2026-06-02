import { ChartCard } from "@/components/cards/ChartCard";
import { StatCard } from "@/components/cards/StatCard";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { AppShell, PageHeader } from "@/components/layout";
import { ReviewTable } from "@/components/tables/ReviewTable";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { mockPreprocessingSummary, mockReviews } from "@/lib/mock-data";

export default function PreprocessingPage() {
  return (
    <AppShell>
      <PageHeader
        description="Menjelaskan pipeline pembersihan teks sebelum hasil ulasan digunakan oleh IndoBERT dan SVM."
        eyebrow="Persiapan teks"
        title="Prapemrosesan"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          description="Jumlah ulasan sebelum pipeline teks."
          label="Ulasan Mentah"
          value={mockPreprocessingSummary.rawReviews}
        />
        <StatCard
          description="Baris yang sudah memiliki teks bersih mock."
          label="Ulasan Diproses"
          tone="positive"
          value={mockPreprocessingSummary.processedReviews}
        />
        <StatCard
          description="Tidak ada duplikasi pada sampel demo."
          label="Duplikasi Dihapus"
          value={mockPreprocessingSummary.removedDuplicates}
        />
        <StatCard
          description="Tidak ada teks kosong setelah pembersihan."
          label="Kosong Setelah Cleaning"
          tone="positive"
          value={mockPreprocessingSummary.emptyAfterCleaning}
        />
        <StatCard
          description="Total token dari teks bersih mock."
          label="Token Bersih"
          tone="primary"
          value={mockPreprocessingSummary.cleanedTokenCount}
        />
        <StatCard
          description="Status proses untuk demonstrasi skripsi."
          label="Status Pipeline"
          tone="primary"
          value={mockPreprocessingSummary.status}
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
            data={mockPreprocessingSummary.pipelineSteps}
            minWidthClassName="min-w-[760px]"
            rowKey={(row) => row.id}
          />
        </ChartCard>

        <SummaryCard
          description="Catatan ini membantu menjelaskan batas UI: frontend menampilkan output, bukan menjalankan pipeline ML."
          title="Ringkasan Proses"
        >
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {mockPreprocessingSummary.noiseSummary.map((item) => (
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
        description="Contoh before/after dipertahankan agar transformasi teks dapat diaudit secara visual."
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
              key: "status",
              header: "Status",
              render: (row) => (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {row.status}
                </span>
              ),
            },
          ]}
          data={mockPreprocessingSummary.textSamples}
          minWidthClassName="min-w-[840px]"
          rowKey={(row) => row.id}
        />
      </ChartCard>

      <ChartCard
        description="Tabel ini menampilkan data yang siap digunakan oleh halaman Analisis Sentimen dan Klasifikasi Aspek."
        title="Ringkasan Data Diproses"
      >
        <ReviewTable reviews={mockReviews.filter((review) => review.isProcessed)} />
      </ChartCard>
    </AppShell>
  );
}
