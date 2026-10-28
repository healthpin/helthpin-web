import type { ReactNode } from "react";

import { Logo } from "@/components/ui/Logo";
import { ShieldIcon } from "@/components/ui/icons";

/** Split screen for sign-in: brand panel on wide screens, form card on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(420px,.9fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-accent">
          <ShieldIcon />
          HEALTH PIN ADMINISTRATION
        </div>
        <div className="max-w-lg">
          <h1 className="max-w-[12ch] text-4xl font-bold leading-[1.08] tracking-[-0.035em] xl:text-5xl">
            Care operations, clearly connected.
          </h1>
          <p className="mt-5 max-w-[46ch] text-base leading-7 text-white/72">
            One secure workspace for Health Pin administrators and partner hospitals to keep care moving.
          </p>
          <div className="mt-10 grid max-w-md gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15">
            {["Role-aware access", "Hospital operations", "Live care workflows"].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-brand px-4 py-3.5 text-sm font-medium text-white/88">
                <span aria-hidden="true" className="size-2.5 rounded-full bg-accent shadow-[0_0_0_4px_rgba(232,201,110,0.14)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/60">© Health Pin</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:bg-surface-low">
        <div className="w-full max-w-[460px]">
          <Logo className="mb-8" caption="Admin & Hospital Portal" />
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">{children}</div>
          <p className="mt-5 text-center text-xs leading-5 text-subtle">Authorized Health Pin administrators and hospital teams only.</p>
        </div>
      </main>
    </div>
  );
}
