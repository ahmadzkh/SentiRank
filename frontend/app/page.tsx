import { PageHeader } from "@/components/layout";

export default function Home() {
  return (
    <>
      <PageHeader
        description="Main layout foundation for SentiRank. Dashboard analytics content, metrics, charts, and tables are intentionally reserved for FE-09."
        eyebrow="FE-08 Layout Foundation"
        title="Dashboard"
      />

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <h3 className="text-base font-semibold text-foreground">
            Dashboard shell is ready
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The application now has a reusable sidebar, topbar, and responsive
            main content area. This placeholder confirms the layout structure
            without adding dashboard data or page-specific workflows.
          </p>
        </div>
      </section>
    </>
  );
}
