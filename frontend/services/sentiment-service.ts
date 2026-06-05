import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  EvaluationSummary,
  SentimentResult,
  SentimentSummary,
  TextAnalysisRequest,
} from "@/types";

export function predictSentiment(
  input: TextAnalysisRequest,
): Promise<SentimentResult> {
  return httpClient.postData<SentimentResult>(API_ENDPOINTS.sentiment.predict, input);
}

export function getSentimentSummary(): Promise<SentimentSummary> {
  return httpClient.getData<SentimentSummary>(API_ENDPOINTS.sentiment.summary);
}

export function getSentimentEvaluation(): Promise<EvaluationSummary> {
  return httpClient.getData<EvaluationSummary>(API_ENDPOINTS.sentiment.evaluation);
}
