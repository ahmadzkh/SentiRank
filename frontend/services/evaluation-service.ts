import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { STATIC_DATA_REQUEST } from "@/lib/api-cache";
import { httpClient } from "@/lib/http-client";
import type { GatewayEvaluationSummary } from "@/types";

export function getEvaluationSummary(): Promise<GatewayEvaluationSummary> {
  return httpClient.getData<GatewayEvaluationSummary>(
    API_ENDPOINTS.evaluation.summary,
    STATIC_DATA_REQUEST,
  );
}
