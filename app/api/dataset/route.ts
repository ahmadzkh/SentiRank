import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";

export function GET(): NextResponse<ApiResponse<null>> {
  try {
    return createSuccessResponse(
      "Dataset API boundary is ready. Data access is not implemented yet.",
    );
  } catch {
    return createErrorResponse("Unable to resolve dataset API boundary.");
  }
}
