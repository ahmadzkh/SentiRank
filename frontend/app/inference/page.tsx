"use client";

import { RuntimeInferencePanel } from "@/components/forms/RuntimeInferencePanel";
import { AppShell, PageHeader } from "@/components/layout";
import { safeGatewayData } from "@/lib/api-status";
import { getRuntimeInferenceHistory } from "@/services/inference-service";
import type { RuntimeInferenceHistoryResponse } from "@/types";
import { useEffect, useState } from "react";
import { PageSkeleton } from "@/components/ui/SkeletonShimmer";

const HISTORY_PAGE_SIZE = 10;

const EMPTY_HISTORY: RuntimeInferenceHistoryResponse = {
  items: [],
  total: 0,
  page: 1,
  limit: HISTORY_PAGE_SIZE,
  total_pages: 1,
};

const ShellPageSkeleton = () => (
  <AppShell>
    <PageHeader
      description="Uji satu ulasan dengan IndoBERT dan SVM."
      eyebrow="Runtime"
      title="Uji Ulasan"
    />
    <PageSkeleton />
  </AppShell>
);

export default function InferencePage() {
  const [inferenceResult, setInferenceResult] = useState<{data: any; error: any} | null>(null);

  useEffect(() => {
    safeGatewayData(
      () => getRuntimeInferenceHistory({ limit: HISTORY_PAGE_SIZE, page: 1 }),
      EMPTY_HISTORY,
    ).then(setInferenceResult);
  }, []);

  if (!inferenceResult) return <ShellPageSkeleton />;

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
