import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { STATIC_DATA_REQUEST } from "@/lib/api-cache";
import { httpClient } from "@/lib/http-client";
import type {
  GatewayRandomReviewsResponse,
  ReviewListQuery,
} from "@/types";

export function getReviews(
  query?: ReviewListQuery,
): Promise<GatewayRandomReviewsResponse> {
  return httpClient.getData<GatewayRandomReviewsResponse>(
    API_ENDPOINTS.reviews.random,
    {
      ...STATIC_DATA_REQUEST,
      query,
    },
  );
}

export function getLatestNegativeReviews(
  query?: Pick<ReviewListQuery, "limit" | "sort">,
): Promise<GatewayRandomReviewsResponse> {
  return httpClient.getData<GatewayRandomReviewsResponse>(
    API_ENDPOINTS.reviews.latestNegative,
    {
      ...STATIC_DATA_REQUEST,
      query,
    },
  );
}
