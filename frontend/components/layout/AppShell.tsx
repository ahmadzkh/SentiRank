import type { ReactNode } from "react";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import type { NavigationItem } from "@/types/navigation";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { MobileSidebar } from "./MobileSidebar";

interface AppShellProps {
  children: ReactNode;
  sidebarItems?: readonly NavigationItem[];
  topbarTitle?: string;
  topbarContextLabel?: string;
  topbarStatusLabel?: string;
  topbarActions?: ReactNode;
}

export function AppShell({
  children,
  sidebarItems = NAVIGATION_ITEMS,
  topbarTitle = "SentiRank",
  topbarContextLabel = "Research analytics dashboard",
  topbarStatusLabel = "Light Mode",
  topbarActions,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AppSidebar items={sidebarItems} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar
            actions={topbarActions}
            contextLabel={topbarContextLabel}
            statusLabel={topbarStatusLabel}
            title={topbarTitle}
          />
          <MobileSidebar items={sidebarItems} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
