import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";
import {
  requestRanking,
  type MlPlaceholderData,
} from "@/services/ml/mlServiceClient";

type RankingApiResponse = NextResponse<
  ApiResponse<MlPlaceholderData> | ApiResponse<null>
>;

export async function GET(): Promise<RankingApiResponse> {
  try {
    const mlResponse = await requestRanking();

    if (!mlResponse.success) {
      return createErrorResponse(mlResponse.message, mlResponse.statusCode);
    }

    return createSuccessResponse(mlResponse.message, mlResponse.data);
  } catch {
    return createErrorResponse("Unable to resolve ranking API boundary.");
  }
}
