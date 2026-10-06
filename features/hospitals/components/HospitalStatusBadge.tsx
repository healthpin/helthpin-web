import { cn } from "@/lib/utils/cn";

export function HospitalStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active ? "bg-success-soft text-success" : "bg-canvas text-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-subtle")}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
