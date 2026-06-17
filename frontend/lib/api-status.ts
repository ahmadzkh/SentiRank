import type { ApiGatewayFailure } from "@/types";
import {
  API_GATEWAY_OFFLINE_MESSAGE,
  ApiGatewayUnavailableError,
} from "@/lib/http-client";

export const EMPTY_GATEWAY_MESSAGE =
  "Data belum tersedia karena API Gateway belum aktif.";

export interface GatewayDataResult<TData> {
  data: TData;
  error: ApiGatewayFailure | null;
  isAvailable: boolean;
}

export function createApiGatewayFailure(
  details?: Record<string, unknown>,
): ApiGatewayFailure {
  return {
    source: "api-gateway",
    message: API_GATEWAY_OFFLINE_MESSAGE,
    status: "unavailable",
    details,
  };
}

export function normalizeApiGatewayError(error: unknown): ApiGatewayFailure {
  if (error instanceof ApiGatewayUnavailableError) {
    return createApiGatewayFailure(error.details);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "source" in error &&
    "status" in error
  ) {
    const candidate = error as Partial<ApiGatewayFailure>;
    if (
      candidate.source === "api-gateway" &&
      candidate.status === "unavailable"
    ) {
      return {
        source: "api-gateway",
        message: candidate.message ?? API_GATEWAY_OFFLINE_MESSAGE,
        status: "unavailable",
        details: candidate.details,
      };
    }
  }

  return createApiGatewayFailure({
    message: error instanceof Error ? error.message : String(error),
  });
}

export async function safeGatewayData<TData>(
  loader: () => Promise<TData>,
  emptyData: TData,
): Promise<GatewayDataResult<TData>> {
  try {
    return {
      data: await loader(),
      error: null,
      isAvailable: true,
    };
  } catch (error) {
    return {
      data: emptyData,
      error: normalizeApiGatewayError(error),
      isAvailable: false,
    };
  }
}
