import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { PreprocessingSummary } from "@/types";

export function getPreprocessingSummary(): Promise<PreprocessingSummary> {
  return httpClient.getData<PreprocessingSummary>(
    API_ENDPOINTS.preprocessing.summary,
  );
}
