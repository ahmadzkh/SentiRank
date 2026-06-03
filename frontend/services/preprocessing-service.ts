import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { ApiResponse, PreprocessingSummary } from "@/types";

// TODO(FE-12): Connect this draft placeholder to the real Preprocessing API after backend contracts are approved. Pages stay mock-first for now.
export function getPreprocessingSummary(): Promise<
  ApiResponse<PreprocessingSummary>
> {
  return httpClient.get<PreprocessingSummary>(
    API_ENDPOINTS.preprocessing.summary,
  );
}
