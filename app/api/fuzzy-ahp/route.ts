import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";

export function GET(): NextResponse<ApiResponse<null>> {
  try {
    return createSuccessResponse(
      "Fuzzy AHP API boundary is ready. Fuzzy AHP calculation is not implemented yet.",
    );
  } catch {
    return createErrorResponse("Unable to resolve Fuzzy AHP API boundary.");
  }
}
