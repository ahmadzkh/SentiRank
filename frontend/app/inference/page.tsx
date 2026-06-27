import { RuntimeInferencePanel } from "@/components/forms/RuntimeInferencePanel";
import { AppShell, PageHeader } from "@/components/layout";
import { safeGatewayData } from "@/lib/api-status";
import { getRuntimeInferenceHistory } from "@/services/inference-service";
import type { RuntimeInferenceHistoryResponse } from "@/types";

export const dynamic = "force-dynamic";

const EMPTY_HISTORY: RuntimeInferenceHistoryResponse = {
  items: [],
  total: 0,
};

export default async function InferencePage() {
  const inferenceResult = await safeGatewayData(
    () => getRuntimeInferenceHistory({ limit: 20 }),
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
