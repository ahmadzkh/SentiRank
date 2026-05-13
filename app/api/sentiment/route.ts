import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";

export function GET(): NextResponse<ApiResponse<null>> {
  try {
    return createSuccessResponse(
      "Sentiment API boundary is ready. ML inference is not implemented yet.",
    );
  } catch {
    return createErrorResponse("Unable to resolve sentiment API boundary.");
  }
}
