import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";

export function GET(): NextResponse<ApiResponse<null>> {
  try {
    return createSuccessResponse(
      "Ranking API boundary is ready. Priority ranking is not implemented yet.",
    );
  } catch {
    return createErrorResponse("Unable to resolve ranking API boundary.");
  }
}
