import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  GatewayAspectEvaluation,
  GatewayAspectSummary,
  AspectResult,
  TextAnalysisRequest,
} from "@/types";

export function classifyAspect(
  input: TextAnalysisRequest,
): Promise<AspectResult> {
  return httpClient.postData<AspectResult>(API_ENDPOINTS.aspects.classify, input);
}

export function getAspectSummary(): Promise<GatewayAspectSummary> {
  return httpClient.getData<GatewayAspectSummary>(API_ENDPOINTS.aspects.summary);
}

export function getAspectEvaluation(): Promise<GatewayAspectEvaluation> {
  return httpClient.getData<GatewayAspectEvaluation>(
    API_ENDPOINTS.aspects.evaluation,
  );
}
