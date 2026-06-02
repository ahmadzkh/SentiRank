import type { AhpCriterion, PairwiseComparison } from "./ahp";
import type { FuzzyScaleOption } from "./fuzzy-ahp";
import type { AspectLabel } from "./aspect";
import type { ReviewSentimentLabel } from "./sentiment";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type ApiQueryValue = string | number | boolean | null | undefined;

export type ApiQueryParams = Record<
  string,
  ApiQueryValue | readonly ApiQueryValue[]
>;

export interface ApiRequestOptions<
  TBody = unknown,
  TQuery extends object = object,
> extends Omit<RequestInit, "body"> {
  body?: TBody;
  query?: TQuery;
}

export interface ReviewListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  rating?: number;
  sentiment?: ReviewSentimentLabel;
  aspect?: AspectLabel;
}

export interface TextAnalysisRequest {
  text: string;
  reviewId?: string;
  language?: "id" | "en" | "mixed";
}

export interface AhpCalculationRequest {
  criteria: AhpCriterion[];
  pairwiseComparisons: PairwiseComparison[];
}

export interface FuzzyAhpCalculationRequest extends AhpCalculationRequest {
  scaleOptions?: FuzzyScaleOption[];
}

export interface DatasetSummary {
  sourceName: string;
  status: string;
  totalRows: number;
  uniqueReviews?: number;
  duplicateRows?: number;
  missingValues?: number;
  processedRows?: number;
  labelCoverage?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ScrapingSummary {
  batchId: string;
  sourceName: string;
  status: string;
  requestedReviews: number;
  collectedReviews: number;
  failedItems: number;
  latestBatchDate?: string;
}

export interface PreprocessingSummary {
  status: string;
  rawReviews: number;
  processedReviews: number;
  removedDuplicates: number;
  emptyAfterCleaning: number;
  cleanedTokenCount?: number;
}
