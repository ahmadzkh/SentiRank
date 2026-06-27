import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { GatewayDatasetSummary } from "@/types";

export function getDatasetSummary(): Promise<GatewayDatasetSummary> {
  return httpClient.getData<GatewayDatasetSummary>(API_ENDPOINTS.dataset.summary);
}
