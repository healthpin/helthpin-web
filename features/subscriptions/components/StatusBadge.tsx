import { cn } from "@/lib/utils/cn";

import { PAYMENT_TONE, STATUS_TONE } from "../lib/format";
import type { PaymentStatus, SubscriptionStatus } from "../types/subscription";

const pill = "inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold";

export function SubscriptionStatusBadge({ status, label }: { status: SubscriptionStatus | null; label: string }) {
  return <span className={cn(pill, status ? STATUS_TONE[status] : "bg-brand-soft text-brand")}>{label}</span>;
}

export function PaymentStatusBadge({ status, label }: { status: PaymentStatus; label: string }) {
  return <span className={cn(pill, PAYMENT_TONE[status])}>{label}</span>;
}
