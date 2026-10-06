import type { ReactNode } from "react";

import { Logo } from "@/components/ui/Logo";
import { ShieldIcon } from "@/components/ui/icons";

/** Split screen for sign-in: brand panel on wide screens, form card on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-strong/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 size-96 rounded-full bg-black/10 blur-3xl"
        />
        <div className="relative flex items-center gap-2 text-sm font-semibold tracking-wide text-white/80">
          <ShieldIcon />
          HEALTH PIN ADMINISTRATION
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Manage Health Pin in one place.
          </h1>
          <p className="mt-4 text-lg text-white/75">
            Secure access for Health Pin administrators and partner hospitals.
          </p>
        </div>
        <p className="relative text-sm text-white/60">© Health Pin</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <Logo className="mb-8" caption="Admin & Hospital Portal" />
          {children}
        </div>
      </main>
    </div>
  );
}
