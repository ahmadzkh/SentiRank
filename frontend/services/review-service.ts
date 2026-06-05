import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  Review,
  ReviewListQuery,
} from "@/types";

export interface RandomReviewsResponse {
  reviews: Review[];
  count: number;
  filters: Record<string, unknown>;
  warnings: string[];
}

export function getReviews(
  query?: ReviewListQuery,
): Promise<RandomReviewsResponse> {
  return httpClient.getData<RandomReviewsResponse>(API_ENDPOINTS.reviews.random, {
    query,
  });
}
