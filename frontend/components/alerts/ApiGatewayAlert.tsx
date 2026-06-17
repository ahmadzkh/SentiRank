import type { ApiGatewayFailure } from "@/types";

interface ApiGatewayAlertProps {
  error?: ApiGatewayFailure | null;
}

export function ApiGatewayAlert({ error }: ApiGatewayAlertProps) {
  if (!error) {
    return null;
  }

  return (
    <section
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 shadow-sm"
      role="alert"
    >
      <p className="font-semibold">Data belum tersedia</p>
      <p className="mt-1">
        {error.message ||
          "API Gateway belum aktif. Jalankan microservice backend terlebih dahulu."}
      </p>
    </section>
  );
}
