import type { PaymentStatus, SubscriptionStatus } from "../types/subscription";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: 0 });

/** "11999.00" -> "₹11,999" ; "1499.50" -> "₹1,499.5" */
export function formatMoney(value: string | number): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? rupees.format(amount) : "—";
}

export function months(count: number): string {
  if (count === 12) return "1 year";
  if (count % 12 === 0) return `${count / 12} years`;
  return `${count} month${count === 1 ? "" : "s"}`;
}

const dateTime = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateTime.format(date);
}

export const STATUS_TONE: Record<SubscriptionStatus, string> = {
  TRIAL_ACTIVE: "bg-accent-soft text-accent-ink",
  ACTIVE: "bg-success-soft text-success",
  EXPIRED: "bg-surface-high text-muted",
  PAYMENT_PENDING: "bg-warning-soft text-warning",
  PAYMENT_FAILED: "bg-danger-soft text-danger",
  CANCELLED: "bg-surface-high text-muted",
};

export const PAYMENT_TONE: Record<PaymentStatus, string> = {
  CREATED: "bg-surface-high text-muted",
  PENDING: "bg-warning-soft text-warning",
  PAID: "bg-success-soft text-success",
  FAILED: "bg-danger-soft text-danger",
};
