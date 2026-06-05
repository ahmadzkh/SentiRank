import { API_ENDPOINTS } from "@/lib/api-endpoints";
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
  );
}

export function getSentimentEvaluation(): Promise<GatewaySentimentEvaluation> {
  return httpClient.getData<GatewaySentimentEvaluation>(
    API_ENDPOINTS.sentiment.evaluation,
  );
}
