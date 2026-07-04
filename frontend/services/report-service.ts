import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { STATIC_DATA_REQUEST } from "@/lib/api-cache";
import { httpClient } from "@/lib/http-client";
import type { GatewayRankingComparisonResponse } from "@/types";

export function getRankingComparison(): Promise<GatewayRankingComparisonResponse> {
  return httpClient.getData<GatewayRankingComparisonResponse>(
    API_ENDPOINTS.reports.rankingComparison,
    STATIC_DATA_REQUEST,
  );
}
