"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Circle,
  Database,
  DownloadCloud,
  FileText,
  Gauge,
  LayoutDashboard,
  ListOrdered,
  MessageSquareText,
  Settings,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";
import { cn } from "@/lib/utils";

const iconMap = {
  Database,
  DownloadCloud,
  FileText,
  Gauge,
  LayoutDashboard,
  ListOrdered,
  MessageSquareText,
  Settings,
  Sparkles,
  Tags,
} satisfies Record<string, LucideIcon>;

interface MobileNavigationProps {
  items: readonly NavigationItem[];
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

export function MobileNavigation({ items }: MobileNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="shrink-0 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
      <nav
        aria-label="Navigasi utama mobile"
        className="flex gap-2 overflow-x-auto whitespace-nowrap scroll-smooth pb-1"
      >
        {items.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = getNavigationIcon(item.iconName);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 flex-none items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
                active
                  ? "border-blue-200 bg-blue-50 text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-blue-100 hover:bg-secondary hover:text-foreground",
              )}
              href={item.href}
              key={item.id}
            >
              <Icon aria-hidden="true" className="size-3.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
