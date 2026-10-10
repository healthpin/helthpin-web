import type { ComponentType } from "react";

import { BuildingIcon, CalendarIcon, DashboardIcon, DirectoryIcon, StethoscopeIcon, UsersIcon, type IconProps } from "@/components/ui/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/** Which console the shell is showing. */
export type ShellArea = "admin" | "hospital";

/**
 * Sidebar menus. Add future modules here as their pages are built; nothing
 * else needs to change.
 */
export const navigation: Record<ShellArea, NavSection[]> = {
  admin: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
        { label: "Hospital Directory", href: "/dashboard/hospital-directory", icon: DirectoryIcon },
      ],
    },
  ],
  hospital: [
    {
      items: [
        { label: "Overview", href: "/hospital/dashboard", icon: DashboardIcon },
        { label: "Bookings", href: "/hospital/bookings", icon: CalendarIcon },
        { label: "Doctors", href: "/hospital/doctors", icon: StethoscopeIcon },
        { label: "Live Queue", href: "/hospital/queue", icon: UsersIcon },
        { label: "Profile & Settings", href: "/hospital/settings", icon: BuildingIcon },
      ],
    },
  ],
};

/**
 * The nav item for a path, e.g. to title the header. The most specific match
 * wins, so /dashboard/hospital-directory is "Hospital Directory", not "Dashboard".
 */
export function findNavItem(area: ShellArea, pathname: string): NavItem | undefined {
  return navigation[area]
    .flatMap((section) => section.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
