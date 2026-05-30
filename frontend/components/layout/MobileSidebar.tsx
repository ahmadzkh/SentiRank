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
  Menu,
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

interface MobileSidebarProps {
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

export function MobileSidebar({ items }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <details className="border-b border-border bg-card lg:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium text-foreground">
        <Menu aria-hidden="true" className="size-4 text-primary" />
        Navigation
      </summary>
      <nav className="grid gap-1 px-3 pb-4" aria-label="Mobile primary">
        {items.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = getNavigationIcon(item.iconName);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                active
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              href={item.href}
              key={item.id}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </details>
  );
}
