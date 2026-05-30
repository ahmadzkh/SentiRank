export type NavigationItemStatus = "ready" | "planned" | "disabled";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  description: string;
  iconName: string;
  order: number;
  status: NavigationItemStatus;
  children?: NavigationItem[];
}
