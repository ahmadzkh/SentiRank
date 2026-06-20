import { AppShell, PageHeader } from "@/components/layout";
import { RuntimeInferencePanel } from "@/components/forms/RuntimeInferencePanel";
import { safeGatewayData } from "@/lib/api-status";
import { getRuntimeInferenceHistory } from "@/services/inference-service";
import type { RuntimeInferenceHistoryResponse } from "@/types/inference";

export const dynamic = "force-dynamic";

const EMPTY_HISTORY: RuntimeInferenceHistoryResponse = {
  items: [],
  total: 0,
};

export default async function InferencePage() {
  const historyResult = await safeGatewayData(
    () => getRuntimeInferenceHistory({ limit: 20 }),
    EMPTY_HISTORY,
  );

  return (
    <AppShell>
      <PageHeader
        description="Analisis satu ulasan Spotify menggunakan IndoBERT dan SVM, lalu periksa riwayat runtime yang tersimpan."
        eyebrow="Runtime inference"
        title="Uji Ulasan"
      />

      <RuntimeInferencePanel
        initialGatewayError={historyResult.error}
        initialHistory={historyResult.data}
      />
    </AppShell>
  );
}
