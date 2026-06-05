import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { ReportSummary } from "@/types";

export function getReportSummary(): Promise<ReportSummary> {
  return httpClient.getData<ReportSummary>(API_ENDPOINTS.reports.summary);
}
