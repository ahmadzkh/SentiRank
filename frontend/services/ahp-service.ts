import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  GatewayAhpCalculateRequest,
  GatewayAhpCalculateResponse,
  GatewayCriterion,
  GatewayRankingComparisonRequest,
  GatewayRankingComparisonResponse,
} from "@/types";

export function getAhpCriteria(): Promise<GatewayCriterion[]> {
  return httpClient.getData<GatewayCriterion[]>(API_ENDPOINTS.ahp.criteria);
}

export function calculateAhp(
  input: GatewayAhpCalculateRequest,
): Promise<GatewayAhpCalculateResponse> {
  return httpClient.postData<GatewayAhpCalculateResponse>(
    API_ENDPOINTS.ahp.calculate,
    input,
  );
}

export function compareAhpFuzzyAhp(
  input: GatewayRankingComparisonRequest,
): Promise<GatewayRankingComparisonResponse> {
  return httpClient.postData<GatewayRankingComparisonResponse>(
    API_ENDPOINTS.ahp.compare,
    input,
  );
}
