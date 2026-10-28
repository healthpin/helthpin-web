"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 64rem)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function closeDrawer() {
    onClose();
    if (!isDesktop) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLButtonElement>('[aria-controls="admin-sidebar"]')?.focus();
      });
    }
  }

  return (
    <>
      {/* Backdrop for the mobile drawer */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={cn(
          "fixed inset-0 z-30 bg-ink/50 transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        id="admin-sidebar"
        inert={!isDesktop && !isOpen}
        aria-hidden={!isDesktop && !isOpen ? true : undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-68 flex-col bg-brand text-white shadow-[8px_0_30px_-24px_rgba(37,24,30,0.55)] transition-transform duration-200",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
          <Logo inverse caption={area === "hospital" ? "Hospital workspace" : "Super Admin"} />
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close menu"
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-white/75 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-5">
          {navigation[area].map((section, index) => (
            <div key={section.title ?? index} className="mb-6">
              {section.title && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent/80">
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
                        onClick={() => !isDesktop && closeDrawer()}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                          isActive
                            ? "bg-white text-brand before:absolute before:-left-3 before:h-7 before:w-1 before:rounded-r-full before:bg-accent"
                            : "text-white/72 hover:bg-white/10 hover:text-white",
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
        {area === "hospital" && <div className="m-4 border-t border-white/12 px-1 pt-4"><p className="text-sm font-semibold text-accent">Care, connected.</p><p className="mt-1 text-xs leading-5 text-white/65">Manage appointments, support your doctors and keep patients moving.</p></div>}
      </aside>
    </>
  );
}
