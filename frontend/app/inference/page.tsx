import { RuntimeInferencePanel } from "@/components/forms/RuntimeInferencePanel";
import { AppShell, PageHeader } from "@/components/layout";
import { safeGatewayData } from "@/lib/api-status";
import { getRuntimeInferenceHistory } from "@/services/inference-service";
import type { RuntimeInferenceHistoryResponse } from "@/types";

export const dynamic = "force-dynamic";

const HISTORY_PAGE_SIZE = 10;

const EMPTY_HISTORY: RuntimeInferenceHistoryResponse = {
  items: [],
  total: 0,
  page: 1,
  limit: HISTORY_PAGE_SIZE,
  total_pages: 1,
};

export default async function InferencePage() {
  const inferenceResult = await safeGatewayData(
    () => getRuntimeInferenceHistory({ limit: HISTORY_PAGE_SIZE, page: 1 }),
    EMPTY_HISTORY,
  );

  return (
    <AppShell>
      <PageHeader
        description="Uji satu ulasan dengan IndoBERT dan SVM."
        eyebrow="Runtime"
        title="Uji Ulasan"
      />

      <RuntimeInferencePanel
        initialGatewayError={inferenceResult.error}
        initialHistory={inferenceResult.data}
      />
    </AppShell>
  );
}
