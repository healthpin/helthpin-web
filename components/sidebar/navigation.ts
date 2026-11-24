import type { ComponentType } from "react";

import { BuildingIcon, CalendarIcon, CreditCardIcon, DashboardIcon, DirectoryIcon, ClipboardIcon, StethoscopeIcon, UsersIcon, type IconProps } from "@/components/ui/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
  /** Hospital pages that need an active free trial or paid subscription. */
  requiresSubscription?: boolean;
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
        { label: "Hospital Registrations", href: "/hospital-registrations", icon: ClipboardIcon },
        { label: "Subscription Management", href: "/subscriptions", icon: CreditCardIcon },
      ],
    },
  ],
  hospital: [
    {
      items: [
        { label: "Overview", href: "/hospital/dashboard", icon: DashboardIcon, requiresSubscription: true },
        { label: "Bookings", href: "/hospital/bookings", icon: CalendarIcon, requiresSubscription: true },
        { label: "Doctors", href: "/hospital/doctors", icon: StethoscopeIcon, requiresSubscription: true },
        { label: "Live Queue", href: "/hospital/queue", icon: UsersIcon, requiresSubscription: true },
        { label: "Subscription", href: "/hospital/subscription", icon: CreditCardIcon },
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
