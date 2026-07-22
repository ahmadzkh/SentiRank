"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Circle,
  Database,
  DownloadCloud,
  LayoutDashboard,
  ListOrdered,
  MessageSquareText,
  ScanText,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";
import { cn } from "@/lib/utils";
import { useCachePreloader } from "@/lib/data-cache";

const iconMap = {
  Database,
  DownloadCloud,
  LayoutDashboard,
  ListOrdered,
  MessageSquareText,
  ScanText,
  Sparkles,
  Tags,
} satisfies Record<string, LucideIcon>;

interface AppSidebarProps {
  items: readonly NavigationItem[];
  className?: string;
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getNavigationIcon(iconName: string) {
  return iconMap[iconName as keyof typeof iconMap] ?? Circle;
}

type Preloader = (p: ReturnType<typeof useCachePreloader>) => void;

const ROUTE_PRELOADERS: Record<string, Preloader> = {
  "/dashboard": (p) =>
    p("dashboard-summary", () =>
      import("@/services/dashboard-service").then((m) => m.getDashboardSummary()),
    ),
  "/dataset": (p) =>
    p("dataset", () =>
      Promise.all([
        import("@/services/dataset-service").then((m) => m.getDatasetSummary()),
        import("@/services/review-service").then((m) =>
          m.getReviews({ limit: 10, seed: 10 }),
        ),
        import("@/services/scraping-service").then((m) => m.getScrapingSummary()),
      ]),
    ),
  "/preprocessing": (p) =>
    p("preprocessing", () =>
      import("@/services/preprocessing-service").then((m) => m.getPreprocessingSummary()),
    ),
  "/sentiment-analysis": (p) =>
    p("sentiment", () =>
      Promise.all([
        import("@/services/sentiment-service").then((m) => m.getSentimentSummary()),
        import("@/services/sentiment-service").then((m) => m.getSentimentEvaluation()),
      ]),
    ),
  "/aspect-classification": (p) =>
    p("aspect", () =>
      Promise.all([
        import("@/services/aspect-service").then((m) => m.getAspectSummary()),
        import("@/services/aspect-service").then((m) => m.getAspectEvaluation()),
      ]),
    ),
  "/ahp-fuzzy-ahp": (p) =>
    p("ahp-overview", () =>
      import("@/services/ahp-overview-service").then((m) => m.getAhpFuzzyAhpOverview()),
    ),
  "/inference": (p) =>
    p("inference-history", () =>
      import("@/services/inference-service").then((m) =>
        m.getRuntimeInferenceHistory({ limit: 10, page: 1 }),
      ),
    ),
};

export function AppSidebar({ items, className }: AppSidebarProps) {
  const pathname = usePathname();
  const preload = useCachePreloader();

  return (
    <aside
      className={cn(
        "hidden h-dvh w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:left-0 lg:top-0 lg:flex lg:flex-col",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
        <Link
          className="rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          href="/"
        >
          <p className="text-sm font-semibold text-sidebar-foreground">
            SentiRank
          </p>
          <p className="text-xs text-muted-foreground">
            Analitik Penelitian
          </p>
        </Link>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
        aria-label="Navigasi utama"
      >
        <div className="space-y-1">
          {items.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            const Icon = getNavigationIcon(item.iconName);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                href={item.href}
                key={item.id}
                onMouseEnter={() => ROUTE_PRELOADERS[item.href]?.(preload)}
                prefetch={true}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0",
                    active
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
