import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { ScrapingSummary } from "@/types";

export function getScrapingSummary(): Promise<ScrapingSummary> {
  return httpClient.getData<ScrapingSummary>(API_ENDPOINTS.scraping.summary);
}
