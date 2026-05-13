import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

interface DashboardLayoutProps {
  readonly children: ReactNode;
}

const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/dataset", label: "Dataset" },
  { href: "/dashboard/sentiment", label: "Sentiment" },
  { href: "/dashboard/aspects", label: "Aspects" },
  { href: "/dashboard/evaluation", label: "Evaluation" },
  { href: "/dashboard/ahp", label: "AHP" },
  { href: "/dashboard/ranking", label: "Ranking" },
] as const;

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): ReactElement {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link className="text-lg font-semibold" href="/">
            SentiRank
          </Link>
          <nav aria-label="Dashboard navigation">
            <ul className="flex flex-wrap gap-2">
              {dashboardLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="inline-flex rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
