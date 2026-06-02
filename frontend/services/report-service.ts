import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { ApiResponse, ReportSummary } from "@/types";

// TODO(FE-12): Connect this draft placeholder to the real Report API after backend contracts are approved. Pages stay mock-first for now.
export function getReportSummary(): Promise<ApiResponse<ReportSummary>> {
  return httpClient.get<ReportSummary>(API_ENDPOINTS.reports.summary);
}
