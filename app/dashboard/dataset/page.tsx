import type { ReactElement } from "react";

export default function DatasetPage(): ReactElement {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Dashboard Module
      </p>
      <h1 className="text-3xl font-semibold tracking-normal">
        Dataset Information
      </h1>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        Foundation route for dataset information and statistics.
      </p>
    </section>
  );
}
