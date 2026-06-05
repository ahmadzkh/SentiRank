import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  AspectResult,
  AspectSummary,
  EvaluationSummary,
  TextAnalysisRequest,
} from "@/types";

export function classifyAspect(
  input: TextAnalysisRequest,
): Promise<AspectResult> {
  return httpClient.postData<AspectResult>(API_ENDPOINTS.aspects.classify, input);
}

export function getAspectSummary(): Promise<AspectSummary> {
  return httpClient.getData<AspectSummary>(API_ENDPOINTS.aspects.summary);
}

export function getAspectEvaluation(): Promise<EvaluationSummary> {
  return httpClient.getData<EvaluationSummary>(API_ENDPOINTS.aspects.evaluation);
}
