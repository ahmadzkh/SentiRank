import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { EvaluationSummary } from "@/types";

export function getEvaluationSummary(): Promise<EvaluationSummary> {
  return httpClient.getData<EvaluationSummary>(API_ENDPOINTS.evaluation.summary);
}
