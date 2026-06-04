import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiRequestOptions, ApiResponse } from "@/types/api";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    Object.prototype.hasOwnProperty.call(value, "data")
  );
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

function normalizeApiResponse<TData>(payload: unknown): ApiResponse<TData> {
  if (isApiResponse(payload)) {
    return {
      ...payload,
      data: (payload.data ?? null) as TData | null,
    };
  }

  return {
    success: true,
    data: payload as TData,
  };
}

function headersToRecord(headers?: HeadersInit) {
  if (!headers) {
    return undefined;
  }

  return Object.fromEntries(new Headers(headers).entries());
}

function describePayload(payload: unknown) {
  if (!payload) {
    return undefined;
  }

  if (isRecord(payload)) {
    if (typeof payload.detail === "string") {
      return payload.detail;
    }

    if (Array.isArray(payload.detail)) {
      return payload.detail
        .map((item) =>
          isRecord(item) && typeof item.msg === "string" ? item.msg : null,
        )
        .filter(Boolean)
        .join("; ");
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }
  }

  return undefined;
}

function classifyAxiosError<TData>(
  error: AxiosError<unknown>,
  baseUrl: string,
  endpoint: string,
): ApiResponse<TData> {
  if (!error.response) {
    return createErrorResponse<TData>(
      "NETWORK_OR_CORS_ERROR",
      `Network/CORS error: frontend tidak dapat menjangkau ${baseUrl}${endpoint}. Pastikan FastAPI berjalan, NEXT_PUBLIC_API_BASE_URL benar, dan CORS backend mengizinkan origin frontend.`,
      {
        baseUrl,
        endpoint,
        axiosCode: error.code,
        originalMessage: error.message,
      },
    );
  }

  const payload = error.response.data;
  const status = error.response.status;
  const payloadMessage = describePayload(payload);

  if (status === 404) {
    return createErrorResponse<TData>(
      "ENDPOINT_NOT_FOUND",
      `404 endpoint mismatch: ${endpoint} tidak ditemukan di backend. Pastikan frontend tidak memanggil /api/ahp dan backend menyediakan route /ahp.`,
      {
        baseUrl,
        endpoint,
        payload: isRecord(payload) ? payload : { payload },
        status,
      },
    );
  }

  if (status === 422) {
    return createErrorResponse<TData>(
      "BACKEND_VALIDATION_ERROR",
      `Backend validation error: ${payloadMessage ?? "payload AHP/Fuzzy AHP tidak valid."}`,
      {
        baseUrl,
        endpoint,
        payload: isRecord(payload) ? payload : { payload },
        status,
      },
    );
  }

  return createErrorResponse<TData>(
    `HTTP_${status}`,
    payloadMessage ?? `Backend mengembalikan HTTP ${status}.`,
    {
      baseUrl,
      endpoint,
      payload: isRecord(payload) ? payload : { payload },
      status,
    },
  );
}

async function request<TData>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<TData>> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return createErrorResponse<TData>(
      "MISSING_API_BASE_URL",
      "Missing base URL: `NEXT_PUBLIC_API_BASE_URL` belum tersedia. Buat atau periksa `frontend/.env.local`, lalu restart NextJS dev server.",
      { endpoint },
    );
  }

  const { body, headers, method = "GET", query, signal } = options;
  const config: AxiosRequestConfig = {
    baseURL: baseUrl,
    data: body,
    headers: headersToRecord(headers),
    method,
    params: query,
    signal: signal ?? undefined,
    url: endpoint,
  };

  try {
    const response = await axios.request<unknown>(config);

    // Axios response shape is { data: { success, message, data } }.
    // The API payload used by UI services is therefore response.data.data.
    return normalizeApiResponse<TData>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return classifyAxiosError<TData>(error, baseUrl, endpoint);
    }

    return createErrorResponse<TData>("UNKNOWN_CLIENT_ERROR", "API request failed.", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export const httpClient = {
  request,
  get<TData>(endpoint: string, options?: ApiRequestOptions) {
    return request<TData>(endpoint, { ...options, method: "GET" });
  },
  post<TData>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<TData>(endpoint, { ...options, body, method: "POST" });
  },
  put<TData>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<TData>(endpoint, { ...options, body, method: "PUT" });
  },
  patch<TData>(endpoint: string, body?: unknown, options?: ApiRequestOptions) {
    return request<TData>(endpoint, { ...options, body, method: "PATCH" });
  },
};
