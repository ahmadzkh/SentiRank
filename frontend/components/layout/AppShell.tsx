import type { ReactNode } from "react";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import type { NavigationItem } from "@/types/navigation";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { MobileNavigation } from "./MobileNavigation";

interface AppShellProps {
  children: ReactNode;
  sidebarItems?: readonly NavigationItem[];
  topbarTitle?: string;
  topbarContextLabel?: string;
  topbarActions?: ReactNode;
}

export function AppShell({
  children,
  sidebarItems = NAVIGATION_ITEMS,
  topbarTitle = "SentiRank",
  topbarContextLabel = "Dashboard analitik penelitian",
  topbarActions,
}: AppShellProps) {
  return (
    <div className="h-dvh overflow-hidden bg-background text-foreground">
      <div className="flex h-full overflow-hidden">
        <AppSidebar items={sidebarItems} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppTopbar
            actions={topbarActions}
            contextLabel={topbarContextLabel}
            title={topbarTitle}
          />
          <MobileNavigation items={sidebarItems} />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
