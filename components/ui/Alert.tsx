import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { AlertIcon, InfoIcon } from "./icons";

type Tone = "error" | "info";

const tones: Record<Tone, string> = {
  error: "border-danger/20 bg-danger-soft text-danger",
  info: "border-brand/15 bg-brand-soft text-brand",
};

export function Alert({ tone = "error", children }: { tone?: Tone; children: ReactNode }) {
  const Icon = tone === "error" ? AlertIcon : InfoIcon;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm", tones[tone])}
    >
      <Icon className="mt-px shrink-0" width={18} height={18} />
      <p className="leading-5">{children}</p>
    </div>
  );
}
