import { NextResponse } from "next/server";

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
}

export function createSuccessResponse<T>(
  message: string,
  data: T | null = null,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
}

export function createErrorResponse(
  message: string,
  status = 500,
): NextResponse<ApiResponse<null>> {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      message,
      data: null,
    },
    { status },
  );
}
