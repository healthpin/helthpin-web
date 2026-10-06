import type { ReactNode } from "react";

/** Responsive grid for StatCards: 1 column on phones up to 4 on desktops. */
export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}
