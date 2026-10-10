"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/ui/Logo";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

import { findNavItem, navigation, type ShellArea } from "./navigation";

interface SidebarProps {
  area: ShellArea;
  /** Mobile drawer state; the sidebar is always visible on large screens. */
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ area, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const active = findNavItem(area, pathname);

  return (
    <>
      {/* Backdrop for the mobile drawer */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-ink/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo caption={area === "hospital" ? "Hospital" : "Super Admin"} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-canvas lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
          {navigation[area].map((section, index) => (
            <div key={section.title ?? index} className="mb-6">
              {section.title && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-subtle">
                  {section.title}
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = active?.href === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-brand-soft text-brand"
                            : "text-muted hover:bg-canvas hover:text-ink",
                        )}
                      >
                        <Icon />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        {area === "hospital" && <div className="m-4 rounded-2xl bg-brand-soft p-4"><p className="text-sm font-semibold text-brand">Care, connected.</p><p className="mt-1 text-xs leading-5 text-muted">Manage appointments, support your doctors and keep patients moving.</p></div>}
      </aside>
    </>
  );
}
