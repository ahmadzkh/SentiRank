import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";

export function GET(): NextResponse<ApiResponse<null>> {
  try {
    return createSuccessResponse(
      "Evaluation API boundary is ready. Model metrics are not implemented yet.",
    );
  } catch {
    return createErrorResponse("Unable to resolve evaluation API boundary.");
  }
}
