import type { ApiQueryValue, ApiRequestOptions, ApiResponse } from "@/types/api";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
export const API_GATEWAY_OFFLINE_MESSAGE =
  "API Gateway belum aktif. Jalankan microservice backend terlebih dahulu.";

function getApiBaseUrl() {
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

function createErrorResponse<TData>(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiResponse<TData> {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
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

  const error: Record<string, unknown> = isRecord(payload.error) ? payload.error : {};
  const code = typeof error.code === "string" ? error.code : "API_ERROR";
  const message =
    typeof payload.message === "string"
      ? payload.message
      : typeof error.message === "string"
        ? error.message
        : "API request failed.";
  const details = isRecord(error.details) ? error.details : undefined;

  return createErrorResponse<TData>(code, message, details);
}

export function unwrapApiEnvelope<TData>(response: ApiResponse<TData>): TData {
  if (response.success) {
    return response.data as TData;
  }

  const message = response.error?.message || response.message || "API request failed.";
  throw new Error(message);
}

async function request<TData>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<TData>> {
  const { body, headers, query, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  if (typeof body !== "undefined" && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(buildUrl(endpoint, query), {
      ...requestOptions,
      body: typeof body === "undefined" ? undefined : JSON.stringify(body),
      headers: requestHeaders,
    });
    const payload = await parseResponseBody(response);

    if (!response.ok) {
      if (isApiResponse(payload)) {
        return normalizeApiResponse<TData>(payload);
      }

      return createErrorResponse<TData>(
        `HTTP_${response.status}`,
        response.statusText || "API request failed.",
        isRecord(payload) ? payload : { payload },
      );
    }

    if (isApiResponse(payload)) {
      return normalizeApiResponse<TData>(payload);
    }

    return {
      success: true,
      data: payload as TData,
    };
  } catch (error) {
    return createErrorResponse<TData>("NETWORK_ERROR", API_GATEWAY_OFFLINE_MESSAGE, {
      message: error instanceof Error ? error.message : String(error),
    });
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
