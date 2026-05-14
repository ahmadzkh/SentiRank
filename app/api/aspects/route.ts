import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";
import {
  requestAspectClassification,
  type MlPlaceholderData,
} from "@/services/ml/mlServiceClient";

type AspectsApiResponse = NextResponse<
  ApiResponse<MlPlaceholderData> | ApiResponse<null>
>;

export async function GET(): Promise<AspectsApiResponse> {
  try {
    const mlResponse = await requestAspectClassification();

    if (!mlResponse.success) {
      return createErrorResponse(mlResponse.message, mlResponse.statusCode);
    }

    return createSuccessResponse(mlResponse.message, mlResponse.data);
  } catch {
    return createErrorResponse("Unable to resolve aspects API boundary.");
  }
}
