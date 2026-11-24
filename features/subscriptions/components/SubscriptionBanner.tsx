import Link from "next/link";

import { formatDate } from "@/lib/utils/format";

import type { SubscriptionSummary } from "../types/subscription";

/**
 * Overview-page reminder: no subscription, trial or period ending within
 * 7 days, or access ended. Renders nothing when all is well.
 */
export function SubscriptionBanner({ sub }: { sub: SubscriptionSummary | null }) {
  if (!sub) return null;
  let message: string | null = null;
  let urgent = false;
  const paidAhead = sub.paid_ahead;

  if (sub.status === null) {
    message = "Activate your Health Pin subscription: start a free trial today, no payment needed.";
  } else if (!sub.has_access) {
    urgent = true;
    message = `Your subscription is ${sub.status_label.toLowerCase()}. Payment is required to continue.`;
  } else if (sub.status === "TRIAL_ACTIVE" && !paidAhead && sub.trial_remaining_days <= 7 && sub.trial_ends_at) {
    message = `Your free trial ends on ${formatDate(sub.trial_ends_at)}. Pay before then to keep access; nothing is charged automatically.`;
  } else if (sub.status === "ACTIVE" && sub.remaining_days <= 7) {
    message = `Your subscription ends in ${sub.remaining_days} day${sub.remaining_days === 1 ? "" : "s"}. Renew to avoid an interruption.`;
  }
  if (!message) return null;

  return (
    <div
      role={urgent ? "alert" : "status"}
      className={`mb-6 flex flex-col gap-3 rounded-2xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${urgent ? "border-danger/20 bg-danger-soft text-danger" : "border-accent/50 bg-accent-soft text-accent-ink"}`}
    >
      <p className="font-medium">{message}</p>
      <Link href="/hospital/subscription" className="shrink-0 rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-hover">
        {sub.status === null ? "View plans" : "Manage subscription"}
      </Link>
    </div>
  );
}
