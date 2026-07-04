export interface RuntimeInferenceRequest {
  text: string;
}

export interface RuntimePredictionBase {
  label: string | null;
  confidence: number | null;
  model_name: string | null;
  mode: string | null;
  prediction_source: string | null;
  model_available: boolean;
  is_fallback: boolean;
}

export interface SentimentInferenceResult extends RuntimePredictionBase {
  probabilities: Record<string, number>;
}

export interface AspectInferenceResult extends RuntimePredictionBase {
  scores: Record<string, number>;
}

export interface RuntimeInferenceResult {
  id: string;
  text: string;
  sentiment: SentimentInferenceResult;
  aspect: AspectInferenceResult;
  saved: boolean;
  created_at: string;
  warnings?: string[];
  persistence_error?: {
    code: string;
    details?: string | Record<string, unknown>;
  };
}

export interface RuntimeInferenceHistoryItem {
  id: string;
  text: string;
  sentiment: SentimentInferenceResult;
  aspect: AspectInferenceResult;
  request_source?: string;
  created_at: string;
}

export interface RuntimeInferenceHistoryResponse {
  items: RuntimeInferenceHistoryItem[];
  total: number;
  page?: number;
  limit?: number;
  total_pages?: number;
}

export interface RuntimeInferenceHistoryQuery {
  limit?: number;
  page?: number;
}
