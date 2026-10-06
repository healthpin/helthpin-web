"use client";

import { useState, type ReactNode } from "react";

import { Header, type ShellAccount } from "@/components/header/Header";
import type { ShellArea } from "@/components/sidebar/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Toaster } from "@/components/ui/toast";

/**
 * Frame for every signed-in page (Super Admin and hospital): sidebar with
 * the area's menu, header and the page content.
 */
export function AppShell({
  area,
  account,
  children,
}: {
  area: ShellArea;
  account: ShellAccount;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Sidebar area={area} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <Header area={area} account={account} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
