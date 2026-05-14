const DEFAULT_ML_SERVICE_URL = "http://127.0.0.1:8000";

export interface MlServiceClientResponse<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
  readonly statusCode: number;
}

export interface MlHealthData {
  readonly service: string;
  readonly status: "healthy";
  readonly version: string;
}

export interface MlPlaceholderData {
  readonly module: string;
  readonly status: string;
}

interface MlServiceApiResponse<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
}

function getMlServiceBaseUrl(): string {
  return process.env.ML_SERVICE_URL?.trim() || DEFAULT_ML_SERVICE_URL;
}

function buildMlServiceUrl(path: string): string {
  const baseUrl = getMlServiceBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return new URL(normalizedPath, normalizedBaseUrl).toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMlHealthData(value: unknown): value is MlHealthData {
  return (
    isRecord(value) &&
    typeof value.service === "string" &&
    value.status === "healthy" &&
    typeof value.version === "string"
  );
}

function isMlPlaceholderData(value: unknown): value is MlPlaceholderData {
  return (
    isRecord(value) &&
    typeof value.module === "string" &&
    typeof value.status === "string"
  );
}

function parseMlServiceResponse<T>(
  payload: unknown,
  isData: (value: unknown) => value is T,
): MlServiceApiResponse<T> | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    typeof payload.success !== "boolean" ||
    typeof payload.message !== "string"
  ) {
    return null;
  }

  const data = payload.data;

  if (data !== null && !isData(data)) {
    return null;
  }

  return {
    success: payload.success,
    message: payload.message,
    data,
  };
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

async function requestMlService<T>(
  path: string,
  isData: (value: unknown) => value is T,
): Promise<MlServiceClientResponse<T>> {
  try {
    const response = await fetch(buildMlServiceUrl(path), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = await readJsonSafely(response);
    const parsedResponse = parseMlServiceResponse(payload, isData);

    if (!response.ok) {
      return {
        success: false,
        message:
          parsedResponse?.message ??
          `ML service request failed with status ${response.status}.`,
        data: null,
        statusCode: response.status,
      };
    }

    if (parsedResponse === null) {
      return {
        success: false,
        message: "ML service returned an invalid response format.",
        data: null,
        statusCode: 502,
      };
    }

    return {
      ...parsedResponse,
      statusCode: response.status,
    };
  } catch {
    return {
      success: false,
      message: "Unable to reach the ML service.",
      data: null,
      statusCode: 503,
    };
  }
}

export function checkMlServiceHealth(): Promise<
  MlServiceClientResponse<MlHealthData>
> {
  return requestMlService("/health", isMlHealthData);
}

export function requestPreprocessing(): Promise<
  MlServiceClientResponse<MlPlaceholderData>
> {
  return requestMlService("/preprocessing", isMlPlaceholderData);
}

export function requestSentimentAnalysis(): Promise<
  MlServiceClientResponse<MlPlaceholderData>
> {
  return requestMlService("/sentiment", isMlPlaceholderData);
}

export function requestAspectClassification(): Promise<
  MlServiceClientResponse<MlPlaceholderData>
> {
  return requestMlService("/aspects", isMlPlaceholderData);
}

export function requestModelEvaluation(): Promise<
  MlServiceClientResponse<MlPlaceholderData>
> {
  return requestMlService("/evaluation", isMlPlaceholderData);
}

export function requestAhpRanking(): Promise<
  MlServiceClientResponse<MlPlaceholderData>
> {
  return requestMlService("/ahp", isMlPlaceholderData);
}

export function requestFuzzyAhpRanking(): Promise<
  MlServiceClientResponse<MlPlaceholderData>
> {
  return requestMlService("/fuzzy-ahp", isMlPlaceholderData);
}

export function requestRanking(): Promise<
  MlServiceClientResponse<MlPlaceholderData>
> {
  return requestMlService("/ranking", isMlPlaceholderData);
}

export function requestRankingComparison(): Promise<
  MlServiceClientResponse<MlPlaceholderData>
> {
  return requestMlService("/ranking-comparison", isMlPlaceholderData);
}
