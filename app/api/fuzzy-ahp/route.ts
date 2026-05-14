import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";
import {
  requestFuzzyAhpRanking,
  type MlPlaceholderData,
} from "@/services/ml/mlServiceClient";

type FuzzyAhpApiResponse = NextResponse<
  ApiResponse<MlPlaceholderData> | ApiResponse<null>
>;

export async function GET(): Promise<FuzzyAhpApiResponse> {
  try {
    const mlResponse = await requestFuzzyAhpRanking();

    if (!mlResponse.success) {
      return createErrorResponse(mlResponse.message, mlResponse.statusCode);
    }

    return createSuccessResponse(mlResponse.message, mlResponse.data);
  } catch {
    return createErrorResponse("Unable to resolve Fuzzy AHP API boundary.");
  }
}
