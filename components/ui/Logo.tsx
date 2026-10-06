import Image from "next/image";

import { cn } from "@/lib/utils/cn";

/** Health Pin mark + wordmark, with an optional caption (e.g. "Super Admin"). */
export function Logo({
  caption = "Super Admin",
  className,
}: {
  caption?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand-logo.jpg"
        alt=""
        width={36}
        height={36}
        className="rounded-lg mix-blend-multiply"
        priority
      />
      <div className="leading-tight">
        <p className="text-[15px] font-bold tracking-tight text-brand">Health Pin</p>
        {caption && <p className="text-xs font-medium text-muted">{caption}</p>}
      </div>
    </div>
  );
}
