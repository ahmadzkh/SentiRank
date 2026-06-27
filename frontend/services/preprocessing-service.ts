import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { GatewayPreprocessingSummary } from "@/types";

export function getPreprocessingSummary(): Promise<GatewayPreprocessingSummary> {
  return httpClient.getData<GatewayPreprocessingSummary>(
    API_ENDPOINTS.preprocessing.summary,
  );
}
