import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { STATIC_DATA_REQUEST } from "@/lib/api-cache";
import { httpClient } from "@/lib/http-client";
import type { GatewayScrapingSummary } from "@/types";

export function getScrapingSummary(): Promise<GatewayScrapingSummary> {
  return httpClient.getData<GatewayScrapingSummary>(
    API_ENDPOINTS.scraping.summary,
    STATIC_DATA_REQUEST,
  );
}
