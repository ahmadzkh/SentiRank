import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";

export function GET(): NextResponse<ApiResponse<null>> {
  try {
    return createSuccessResponse(
      "Ranking comparison API boundary is ready. Ranking comparison is not implemented yet.",
    );
  } catch {
    return createErrorResponse(
      "Unable to resolve ranking comparison API boundary.",
    );
  }
}
