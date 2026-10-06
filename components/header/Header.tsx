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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-controls="admin-sidebar"
        className="grid size-10 cursor-pointer place-items-center rounded-lg text-muted hover:bg-canvas lg:hidden"
      >
        <MenuIcon />
      </button>

      <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="max-w-56 truncate text-sm font-medium text-ink">{account.name}</p>
          <p className="max-w-56 truncate text-xs text-muted">{account.detail}</p>
        </div>
        <div
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-brand text-sm font-semibold text-white"
        >
          {initial}
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
