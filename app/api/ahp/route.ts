import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";

export function GET(): NextResponse<ApiResponse<null>> {
  try {
    return createSuccessResponse(
      "AHP API boundary is ready. AHP calculation is not implemented yet.",
    );
  } catch {
    return createErrorResponse("Unable to resolve AHP API boundary.");
  }
}
