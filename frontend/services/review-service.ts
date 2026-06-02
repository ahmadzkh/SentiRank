import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Review,
  ReviewListQuery,
} from "@/types";

// TODO(FE-12): Connect this draft placeholder to the real Review API after backend contracts are approved. Pages stay mock-first for now.
export function getReviews(
  query?: ReviewListQuery,
): Promise<ApiResponse<PaginatedResponse<Review>>> {
  return httpClient.get<PaginatedResponse<Review>>(API_ENDPOINTS.reviews.list, {
    query,
  });
}
