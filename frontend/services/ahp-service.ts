import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  ApiResponse,
  BackendAhpCalculateRequest,
  BackendAhpCalculateResponse,
  BackendAhpComparisonRequest,
  BackendAhpComparisonResponse,
  BackendAhpCriterion,
} from "@/types";

// TODO(FE-13): These endpoints target backend sample/development AHP services only.
// Keep pages labeled as sample_development_only and not_final_expert_judgement until final expert judgement is approved.
export function getAhpCriteria(): Promise<ApiResponse<BackendAhpCriterion[]>> {
  return httpClient.get<BackendAhpCriterion[]>(API_ENDPOINTS.ahp.criteria);
}

export function calculateAhp(
  input: BackendAhpCalculateRequest,
): Promise<ApiResponse<BackendAhpCalculateResponse>> {
  return httpClient.post<BackendAhpCalculateResponse>(
    API_ENDPOINTS.ahp.calculate,
    input,
  );
}

export function compareAhpFuzzy(
  input: BackendAhpComparisonRequest,
): Promise<ApiResponse<BackendAhpComparisonResponse>> {
  return httpClient.post<BackendAhpComparisonResponse>(
    API_ENDPOINTS.ahp.compare,
    input,
  );
}
