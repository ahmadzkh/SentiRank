import type { NextResponse } from "next/server";

import {
  createErrorResponse,
  createSuccessResponse,
  type ApiResponse,
} from "@/lib/utils/apiResponse";

export function GET(): NextResponse<ApiResponse<null>> {
  try {
    return createSuccessResponse(
      "Aspects API boundary is ready. Aspect classification is not implemented yet.",
    );
  } catch {
    return createErrorResponse("Unable to resolve aspects API boundary.");
  }
}
