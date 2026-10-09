import { cn } from "@/lib/utils/cn";

import type { BookingStatus } from "../types/booking";

const styles: Record<BookingStatus, string> = {
  Pending: "bg-warning-soft text-warning",
  Confirmed: "bg-brand-soft text-brand",
  Completed: "bg-success-soft text-success",
  Cancelled: "bg-canvas text-muted",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
