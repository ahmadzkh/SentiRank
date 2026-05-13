import Link from "next/link";
import type { ReactElement } from "react";

export default function HomePage(): ReactElement {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-3xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            AI Research Dashboard
          </p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
            SentiRank
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Sentiment analysis, aspect classification, and AHP-based priority
            ranking for public review analysis.
          </p>
        </div>
        <Link
          className="inline-flex w-fit items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          href="/dashboard"
        >
          Open Dashboard
        </Link>
      </section>
    </main>
  );
}
