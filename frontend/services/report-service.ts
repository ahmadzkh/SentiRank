import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { GatewayRankingComparisonResponse, GatewayReportSummary } from "@/types";

export function getReportSummary(): Promise<GatewayReportSummary> {
  return httpClient.getData<GatewayReportSummary>(API_ENDPOINTS.reports.summary);
}

export function getRankingComparison(): Promise<GatewayRankingComparisonResponse> {
  return httpClient.getData<GatewayRankingComparisonResponse>(
    API_ENDPOINTS.reports.rankingComparison,
  );
}
