import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "brand" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-canvas text-muted",
  brand: "bg-brand-soft text-brand",
  warning: "bg-warning-soft text-warning",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
