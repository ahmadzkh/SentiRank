import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { ApiResponse, EvaluationSummary } from "@/types";

// TODO(FE-12): Connect this draft placeholder to the real Model Evaluation API after backend contracts are approved. Pages stay mock-first for now.
export function getEvaluationSummary(): Promise<
  ApiResponse<EvaluationSummary>
> {
  return httpClient.get<EvaluationSummary>(API_ENDPOINTS.evaluation.summary);
}
