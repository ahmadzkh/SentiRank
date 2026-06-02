import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  ApiResponse,
  SentimentResult,
  SentimentSummary,
  TextAnalysisRequest,
} from "@/types";

// TODO(FE-12): Connect these draft placeholders to the real Sentiment API after backend contracts are approved. Pages stay mock-first for now.
export function predictSentiment(
  input: TextAnalysisRequest,
): Promise<ApiResponse<SentimentResult>> {
  return httpClient.post<SentimentResult>(API_ENDPOINTS.sentiment.predict, input);
}

export function getSentimentSummary(): Promise<ApiResponse<SentimentSummary>> {
  return httpClient.get<SentimentSummary>(API_ENDPOINTS.sentiment.summary);
}
