import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { ApiResponse, ScrapingSummary } from "@/types";

// TODO(FE-12): Connect this draft placeholder to the real Scraping API after backend contracts are approved. Pages stay mock-first for now.
export function getScrapingSummary(): Promise<ApiResponse<ScrapingSummary>> {
  return httpClient.get<ScrapingSummary>(API_ENDPOINTS.scraping.summary);
}
