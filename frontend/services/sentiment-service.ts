import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { STATIC_DATA_REQUEST } from "@/lib/api-cache";
import { httpClient } from "@/lib/http-client";
import type {
  GatewaySentimentEvaluation,
  GatewaySentimentSummary,
  SentimentResult,
  TextAnalysisRequest,
} from "@/types";

export function predictSentiment(
  input: TextAnalysisRequest,
): Promise<SentimentResult> {
  return httpClient.postData<SentimentResult>(API_ENDPOINTS.sentiment.predict, input);
}

export function getSentimentSummary(): Promise<GatewaySentimentSummary> {
  return httpClient.getData<GatewaySentimentSummary>(
    API_ENDPOINTS.sentiment.summary,
    STATIC_DATA_REQUEST,
  );
}

export function getSentimentEvaluation(): Promise<GatewaySentimentEvaluation> {
  return httpClient.getData<GatewaySentimentEvaluation>(
    API_ENDPOINTS.sentiment.evaluation,
    STATIC_DATA_REQUEST,
  );
}
