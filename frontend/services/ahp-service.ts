import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { AhpCalculationRequest, AhpResult, ApiResponse } from "@/types";

// TODO(FE-12): Connect this draft placeholder to the real AHP calculation service after backend contracts are approved. Do not calculate AHP in the frontend.
export function calculateAhp(
  input: AhpCalculationRequest,
): Promise<ApiResponse<AhpResult>> {
  return httpClient.post<AhpResult>(API_ENDPOINTS.ahp.calculate, input);
}
