import { AppShell } from "./AppShell";

export function RouteLoadingState() {
  return (
    <AppShell>
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
            key={index}
          >
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-8 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-5 h-64 animate-pulse rounded bg-muted" />
      </section>
    </AppShell>
  );
}
