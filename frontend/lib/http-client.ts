import type {
  ApiGatewayFailure,
  ApiQueryValue,
  ApiRequestOptions,
  ApiResponse,
} from "@/types/api";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
export const API_GATEWAY_OFFLINE_MESSAGE =
  "API Gateway belum aktif. Jalankan microservice backend terlebih dahulu.";
const API_GATEWAY_ERROR_CODE = "API_GATEWAY_UNAVAILABLE";
const API_GATEWAY_TIMEOUT_MS = 10_000;

export class ApiGatewayUnavailableError extends Error implements ApiGatewayFailure {
  source = "api-gateway" as const;
  status = "unavailable" as const;
  details?: Record<string, unknown>;

  constructor(details?: Record<string, unknown>) {
    super(API_GATEWAY_OFFLINE_MESSAGE);
    this.name = "ApiGatewayUnavailableError";
    this.details = details;
  }
}

function getApiBaseUrl() {
  if (typeof window === "undefined" && process.env.API_GATEWAY_INTERNAL_URL) {
    return process.env.API_GATEWAY_INTERNAL_URL;
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    isRecord(value) &&
    typeof value.success === "boolean"
  );
}

function appendQueryValue(
  searchParams: URLSearchParams,
  key: string,
  value: ApiQueryValue | readonly ApiQueryValue[],
) {
  if (Array.isArray(value)) {
    value.forEach((item) => appendQueryValue(searchParams, key, item));
    return;
  }

  if (value === null || typeof value === "undefined") {
    return;
  }

  searchParams.append(key, String(value));
}

function buildUrl(endpoint: string, query?: object) {
  const url = new URL(endpoint, getApiBaseUrl());

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      appendQueryValue(
        url.searchParams,
        key,
        value as ApiQueryValue | readonly ApiQueryValue[],
      );
    });
  }

  return url.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function createGatewayUnavailableResponse<TData>(
  details?: Record<string, unknown>,
): ApiResponse<TData> {
  return {
    success: false,
    data: null,
    message: API_GATEWAY_OFFLINE_MESSAGE,
    error: {
      code: API_GATEWAY_ERROR_CODE,
      message: API_GATEWAY_OFFLINE_MESSAGE,
      source: "api-gateway",
      status: "unavailable",
      details,
    },
  };
}

function normalizeApiResponse<TData>(payload: ApiResponse<unknown>): ApiResponse<TData> {
  if (payload.success) {
    return {
      success: true,
      data: (Object.prototype.hasOwnProperty.call(payload, "data")
        ? payload.data
        : null) as TData,
      message: payload.message,
      meta: payload.meta,
    };
  }

  return createGatewayUnavailableResponse<TData>({
    upstream_message: payload.message,
    upstream_error: payload.error,
  });
}

export function unwrapApiEnvelope<TData>(response: ApiResponse<TData>): TData {
  if (response.success) {
    return response.data as TData;
  }

  throw new ApiGatewayUnavailableError(response.error?.details);
}

async function request<TData>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<TData>> {
  const { body, headers, query, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  const abortController = requestOptions.signal
    ? null
    : new AbortController();
  const timeoutId = abortController
    ? setTimeout(() => abortController.abort(), API_GATEWAY_TIMEOUT_MS)
    : null;

  if (typeof body !== "undefined" && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(buildUrl(endpoint, query), {
      ...requestOptions,
      body: typeof body === "undefined" ? undefined : JSON.stringify(body),
      headers: requestHeaders,
      signal: requestOptions.signal ?? abortController?.signal,
    });
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      return createGatewayUnavailableResponse<TData>({
        http_status: response.status,
        http_status_text: response.statusText,
        payload: isRecord(payload) ? payload : { payload },
      });
    }

    if (isApiResponse(payload)) {
      return normalizeApiResponse<TData>(payload);
    }

    return createGatewayUnavailableResponse<TData>({
      reason: "Invalid API Gateway response envelope.",
      payload: isRecord(payload) ? payload : { payload },
    });
  } catch (error) {
    return createGatewayUnavailableResponse<TData>({
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function requestData<TData>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<TData> {
  return unwrapApiEnvelope(await request<TData>(endpoint, options));
}

export const httpClient = {
  request,
  requestData,
  get<TData>(endpoint: string, options?: ApiRequestOptions) {
    return request<TData>(endpoint, { ...options, method: "GET" });
  },
  getData<TData>(endpoint: string, options?: ApiRequestOptions) {
    return requestData<TData>(endpoint, { ...options, method: "GET" });
  },
  post<TData>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<TData>(endpoint, { ...options, body, method: "POST" });
  },
  postData<TData>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return requestData<TData>(endpoint, { ...options, body, method: "POST" });
  },
  put<TData>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<TData>(endpoint, { ...options, body, method: "PUT" });
  },
  patch<TData>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<TData>(endpoint, { ...options, body, method: "PATCH" });
  },
};
