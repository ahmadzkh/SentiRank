import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { ApiResponse, DatasetSummary } from "@/types";

// TODO(FE-12): Connect this draft placeholder to the real Dataset API after backend contracts are approved. Pages stay mock-first for now.
export function getDatasetSummary(): Promise<ApiResponse<DatasetSummary>> {
  return httpClient.get<DatasetSummary>(API_ENDPOINTS.dataset.summary);
}
