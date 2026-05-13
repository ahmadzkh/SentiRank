import type { ReactElement } from "react";

export default function AspectsPage(): ReactElement {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Dashboard Module
      </p>
      <h1 className="text-3xl font-semibold tracking-normal">
        Aspect Classification Result
      </h1>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        Foundation route for aspect labeling results.
      </p>
    </section>
  );
}
