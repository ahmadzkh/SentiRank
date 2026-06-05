import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { DatasetSummary } from "@/types";

export function getDatasetSummary(): Promise<DatasetSummary> {
  return httpClient.getData<DatasetSummary>(API_ENDPOINTS.dataset.summary);
}
