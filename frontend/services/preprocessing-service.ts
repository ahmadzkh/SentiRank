import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { STATIC_DATA_REQUEST } from "@/lib/api-cache";
import { httpClient } from "@/lib/http-client";
import type { GatewayPreprocessingSummary } from "@/types";

export function getPreprocessingSummary(): Promise<GatewayPreprocessingSummary> {
  return httpClient.getData<GatewayPreprocessingSummary>(
    API_ENDPOINTS.preprocessing.summary,
    STATIC_DATA_REQUEST,
  );
}
