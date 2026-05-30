export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-2xl rounded-lg border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-primary">SentiRank Frontend</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
          NextJS foundation is ready.
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          FE-06 sets up the frontend foundation only. Dashboard pages, mock
          data, and the full application layout are intentionally reserved for
          later frontend phases.
        </p>
      </section>
    </main>
  );
}
