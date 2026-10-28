import Image from "next/image";

import { cn } from "@/lib/utils/cn";

/** Health Pin mark + wordmark, with an optional caption (e.g. "Super Admin"). */
export function Logo({
  caption = "Super Admin",
  className,
  inverse = false,
}: {
  caption?: string | null;
  className?: string;
  inverse?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* The supplied logo, unaltered: a transparent PNG with its own clear margin,
          so no background, tint or clipping is applied. Decorative: the wordmark names it. */}
      <Image src="/healthpin-logo.png" alt="" width={48} height={48} className="-mx-1 shrink-0" priority />
      <div className="leading-tight">
        <p className={cn("text-[15px] font-bold tracking-tight", inverse ? "text-white" : "text-brand")}>Health Pin</p>
        {caption && <p className={cn("text-xs font-medium", inverse ? "text-white/70" : "text-muted")}>{caption}</p>}
      </div>
    </div>
  );
}
