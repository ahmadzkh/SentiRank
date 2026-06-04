import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  ApiResponse,
  BackendFuzzyAhpCalculateRequest,
  BackendFuzzyAhpCalculateResponse,
} from "@/types";

// TODO(FE-13): This endpoint targets backend sample/development Fuzzy AHP only.
// Keep pages labeled as sample_development_only and not_final_expert_judgement until final expert judgement is approved.
export function calculateFuzzyAhp(
  input: BackendFuzzyAhpCalculateRequest,
): Promise<ApiResponse<BackendFuzzyAhpCalculateResponse>> {
  return httpClient.post<BackendFuzzyAhpCalculateResponse>(
    API_ENDPOINTS.ahp.fuzzyCalculate,
    input,
  );
}
