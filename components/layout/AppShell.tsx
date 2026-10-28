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
    <div className="min-h-dvh bg-canvas">
      <Sidebar area={area} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-h-dvh flex-col lg:pl-68">
        <Header area={area} account={account} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
