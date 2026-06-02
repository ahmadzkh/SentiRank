import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  ApiResponse,
  FuzzyAhpCalculationRequest,
  FuzzyAhpResult,
} from "@/types";

// TODO(FE-12): Connect this draft placeholder to the real Fuzzy AHP calculation service after backend contracts are approved. Do not calculate Fuzzy AHP in the frontend.
export function calculateFuzzyAhp(
  input: FuzzyAhpCalculationRequest,
): Promise<ApiResponse<FuzzyAhpResult>> {
  return httpClient.post<FuzzyAhpResult>(
    API_ENDPOINTS.fuzzyAhp.calculate,
    input,
  );
}
