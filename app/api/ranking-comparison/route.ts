import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";
import {
  requestRankingComparison,
  type MlPlaceholderData,
} from "@/services/ml/mlServiceClient";

type RankingComparisonApiResponse = NextResponse<
  ApiResponse<MlPlaceholderData> | ApiResponse<null>
>;

export async function GET(): Promise<RankingComparisonApiResponse> {
  try {
    const mlResponse = await requestRankingComparison();

    if (!mlResponse.success) {
      return createErrorResponse(mlResponse.message, mlResponse.statusCode);
    }

    return createSuccessResponse(mlResponse.message, mlResponse.data);
  } catch {
    return createErrorResponse(
      "Unable to resolve ranking comparison API boundary.",
    );
  }
}
