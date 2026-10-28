"use client";

import { usePathname } from "next/navigation";

import { findNavItem, type ShellArea } from "@/components/sidebar/navigation";
import { MenuIcon } from "@/components/ui/icons";

import { LogoutButton } from "./LogoutButton";

/** Who is signed in, as shown in the header. */
export interface ShellAccount {
  /** First line, e.g. the email or the hospital's name. */
  name: string;
  /** Second line, e.g. "Super Admin" or the hospital's email. */
  detail: string;
}

interface HeaderProps {
  area: ShellArea;
  account: ShellAccount;
  onMenuClick: () => void;
}

export function Header({ area, account, onMenuClick }: HeaderProps) {
  const title = findNavItem(area, usePathname())?.label ?? "Health Pin";
  const initial = account.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-line bg-surface px-4 shadow-[0_8px_24px_-24px_rgba(138,16,68,0.45)] sm:px-7 lg:px-10">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-controls="admin-sidebar"
        className="grid size-11 cursor-pointer place-items-center rounded-xl text-muted hover:bg-brand-soft hover:text-brand lg:hidden"
      >
        <MenuIcon />
      </button>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle"><span className="sm:hidden">{area === "hospital" ? "Hospital" : "Admin"}</span><span className="hidden sm:inline">{area === "hospital" ? "Hospital workspace" : "Administration"}</span></p>
        <h1 className="truncate text-lg font-semibold tracking-[-0.02em] text-ink">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="max-w-56 truncate text-sm font-medium text-ink">{account.name}</p>
          <p className="max-w-56 truncate text-xs text-muted">{account.detail}</p>
        </div>
        <div
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-full bg-brand text-sm font-semibold text-white shadow-[0_0_0_3px_var(--color-accent-soft)]"
        >
          {initial}
        </div>
        <LogoutButton aria-label="Sign out" className="px-2.5 sm:px-3 [&>span]:hidden sm:[&>span]:inline" />
      </div>
    </header>
  );
}
