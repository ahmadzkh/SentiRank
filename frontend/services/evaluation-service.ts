import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { GatewayEvaluationSummary } from "@/types";

export function getEvaluationSummary(): Promise<GatewayEvaluationSummary> {
  return httpClient.getData<GatewayEvaluationSummary>(
    API_ENDPOINTS.evaluation.summary,
  );
}
