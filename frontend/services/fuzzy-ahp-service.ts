import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  GatewayFuzzyAhpCalculateRequest,
  GatewayFuzzyAhpCalculateResponse,
} from "@/types";

export function calculateFuzzyAhp(
  input: GatewayFuzzyAhpCalculateRequest,
): Promise<GatewayFuzzyAhpCalculateResponse> {
  return httpClient.postData<GatewayFuzzyAhpCalculateResponse>(
    API_ENDPOINTS.ahp.fuzzyCalculate,
    input,
  );
}
