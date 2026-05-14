import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";
import {
  requestAhpRanking,
  type MlPlaceholderData,
} from "@/services/ml/mlServiceClient";

type AhpApiResponse = NextResponse<
  ApiResponse<MlPlaceholderData> | ApiResponse<null>
>;

export async function GET(): Promise<AhpApiResponse> {
  try {
    const mlResponse = await requestAhpRanking();

    if (!mlResponse.success) {
      return createErrorResponse(mlResponse.message, mlResponse.statusCode);
    }

    return createSuccessResponse(mlResponse.message, mlResponse.data);
  } catch {
    return createErrorResponse("Unable to resolve AHP API boundary.");
  }
}
