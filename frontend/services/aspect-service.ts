import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  ApiResponse,
  AspectResult,
  AspectSummary,
  TextAnalysisRequest,
} from "@/types";

// TODO(FE-12): Connect these draft placeholders to the real Aspect API after backend contracts are approved. Pages stay mock-first for now.
export function classifyAspect(
  input: TextAnalysisRequest,
): Promise<ApiResponse<AspectResult>> {
  return httpClient.post<AspectResult>(API_ENDPOINTS.aspects.classify, input);
}

export function getAspectSummary(): Promise<ApiResponse<AspectSummary>> {
  return httpClient.get<AspectSummary>(API_ENDPOINTS.aspects.summary);
}
