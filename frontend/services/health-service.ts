import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { httpClient } from "@/lib/http-client";
import type { GatewayHealthStatus, GatewayServicesHealthStatus } from "@/types";

export function getGatewayHealth(): Promise<GatewayHealthStatus> {
  return httpClient.getData<GatewayHealthStatus>(API_ENDPOINTS.health.service);
}

export function getGatewayServicesHealth(): Promise<GatewayServicesHealthStatus> {
  return httpClient.getData<GatewayServicesHealthStatus>(
    API_ENDPOINTS.health.services,
  );
}

