import type { ReactNode } from "react";

/** Responsive grid for StatCards: 1 column on phones up to 4 on desktops. */
export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid overflow-hidden rounded-2xl border border-line bg-surface divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">{children}</div>;
}
