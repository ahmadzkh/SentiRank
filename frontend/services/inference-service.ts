import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  RuntimeInferenceHistoryQuery,
  RuntimeInferenceHistoryResponse,
  RuntimeInferenceRequest,
  RuntimeInferenceResult,
} from "@/types/inference";

export function analyzeRuntimeReview(
  input: RuntimeInferenceRequest,
): Promise<RuntimeInferenceResult> {
  return httpClient.postData<RuntimeInferenceResult>(
    API_ENDPOINTS.inference.review,
    input,
  );
}

export function getRuntimeInferenceHistory(
  query: RuntimeInferenceHistoryQuery = { limit: 20 },
): Promise<RuntimeInferenceHistoryResponse> {
  return httpClient.getData<RuntimeInferenceHistoryResponse>(
    API_ENDPOINTS.inference.history,
    { query },
  );
}
