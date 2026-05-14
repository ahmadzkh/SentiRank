import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";
import {
  requestSentimentAnalysis,
  type MlPlaceholderData,
} from "@/services/ml/mlServiceClient";

type SentimentApiResponse = NextResponse<
  ApiResponse<MlPlaceholderData> | ApiResponse<null>
>;

export async function GET(): Promise<SentimentApiResponse> {
  try {
    const mlResponse = await requestSentimentAnalysis();

    if (!mlResponse.success) {
      return createErrorResponse(mlResponse.message, mlResponse.statusCode);
    }

    return createSuccessResponse(mlResponse.message, mlResponse.data);
  } catch {
    return createErrorResponse("Unable to resolve sentiment API boundary.");
  }
}
