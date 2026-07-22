"use client";

import { RuntimeInferencePanel } from "@/components/forms/RuntimeInferencePanel";
import { AppShell, PageHeader } from "@/components/layout";
import { safeGatewayData } from "@/lib/api-status";
import { useCachedData } from "@/lib/data-cache";
import { FadeIn } from "@/components/ui/FadeIn";
import { getRuntimeInferenceHistory } from "@/services/inference-service";
import type { RuntimeInferenceHistoryResponse } from "@/types";
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
  const { data, loading } = useCachedData("inference-history", async () => {
    return safeGatewayData(
      () => getRuntimeInferenceHistory({ limit: HISTORY_PAGE_SIZE, page: 1 }),
      EMPTY_HISTORY,
    );
  });

  if (loading || !data) return <ShellPageSkeleton />;

  return (
    <AppShell>
      <PageHeader
        description="Uji satu ulasan dengan IndoBERT dan SVM."
        eyebrow="Runtime"
        title="Uji Ulasan"
      />
      <FadeIn>
      <RuntimeInferencePanel
        initialGatewayError={data.error}
        initialHistory={data.data}
      />
      </FadeIn>
    </AppShell>
  );
}
