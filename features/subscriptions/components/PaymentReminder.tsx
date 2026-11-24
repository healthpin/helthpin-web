"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { AlertIcon, BellIcon, ClockIcon, CloseIcon, CreditCardIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

import { formatMoney } from "../lib/format";
import type { PaymentReminder as Reminder, SubscriptionSummary } from "../types/subscription";

/**
 * Navbar subscription status. Every date and day count comes from the backend
 * (`status`, `payment_reminder`); this only chooses words and colours. Always
 * links to the Subscription page.
 */

const SUBSCRIPTION_PATH = "/hospital/subscription";

const numericDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** "2026-12-24" (already the hospital's calendar date) -> "24/12/2026". */
function calendarDate(value: string | null, format = numericDate): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "" : format.format(date);
}

const plural = (count: number) => `${count} Day${count === 1 ? "" : "s"}`;

type Tone = "neutral" | "info" | "warning" | "danger" | "muted";

const TONES: Record<Tone, string> = {
  neutral: "border-line bg-surface text-ink hover:border-brand/30 hover:bg-brand-soft",
  info: "border-brand/20 bg-brand-soft text-brand hover:border-brand/40",
  warning: "border-warning/30 bg-warning-soft text-warning hover:border-warning/50",
  danger: "border-danger/25 bg-danger-soft text-danger hover:border-danger/45",
  muted: "border-line bg-surface-high text-muted hover:border-brand/30",
};

interface Display {
  label: string;
  short: string;
  detail: string;
  tone: Tone;
  icon: "bell" | "clock" | "alert" | "card";
}

function describe(sub: SubscriptionSummary): Display {
  const reminder = sub.payment_reminder;
  if (!reminder) {
    // No subscription record yet (perhaps a first payment in flight or failed).
    if (sub.status === "PAYMENT_PENDING") {
      return { label: "Payment Pending", short: "Pending", detail: "Waiting for Razorpay to confirm", tone: "warning", icon: "clock" };
    }
    return {
      label: "Choose a Subscription Plan",
      short: "Choose plan",
      detail: sub.status === "PAYMENT_FAILED" ? "Your last payment failed" : "Required to use the dashboard",
      tone: "danger",
      icon: "card",
    };
  }
  const days = reminder.days_until_due ?? 0;
  const due = calendarDate(reminder.due_date);
  const trial = reminder.reason === "trial_ends";
  switch (reminder.state) {
    case "upcoming":
      return trial
        ? { label: `Free Trial – ${plural(days)} Remaining`, short: `Trial · ${days}d`, detail: `Trial ends ${due}`, tone: "info", icon: "bell" }
        : { label: `Next Payment: ${due}`, short: calendarDate(reminder.due_date, shortDate), detail: `${reminder.plan_name} plan`, tone: "neutral", icon: "bell" };
    case "due_soon":
      return trial
        ? { label: `Trial Ends in ${plural(days)}`, short: `Trial · ${days}d`, detail: `Pay by ${due} to keep access`, tone: "warning", icon: "clock" }
        : { label: `Payment Due in ${plural(days)}`, short: `Due in ${days}d`, detail: `Next payment: ${due}`, tone: "warning", icon: "clock" };
    case "due_today":
      return trial
        ? { label: "Trial Ends Today", short: "Trial ends", detail: "Pay today to keep access", tone: "danger", icon: "alert" }
        : { label: "Payment Due Today", short: "Due today", detail: "Your subscription ends today", tone: "danger", icon: "alert" };
    case "confirming":
      return { label: "Payment Pending", short: "Pending", detail: "Waiting for Razorpay to confirm", tone: "warning", icon: "clock" };
    case "overdue":
      return {
        label: "Payment Pending",
        short: "Pay now",
        detail: sub.status === "PAYMENT_FAILED" ? "Your last payment failed" : reminder.reason === "trial_ended" ? "Your free trial has ended" : "Payment is required to continue",
        tone: "danger",
        icon: "alert",
      };
    case "expired":
      return { label: "Subscription Expired", short: "Expired", detail: due ? `Expired on ${due}` : "Renew to restore access", tone: "danger", icon: "alert" };
    case "cancelled":
      return { label: "Subscription Cancelled", short: "Cancelled", detail: "Subscribe again to restore access", tone: "muted", icon: "alert" };
  }
}

function Icon({ name }: { name: Display["icon"] }) {
  const props = { width: 18, height: 18, className: "shrink-0" };
  if (name === "clock") return <ClockIcon {...props} />;
  if (name === "alert") return <AlertIcon {...props} />;
  if (name === "card") return <CreditCardIcon {...props} />;
  return <BellIcon {...props} />;
}

export function PaymentReminder({ subscription, hospitalId }: { subscription: SubscriptionSummary; hospitalId: number }) {
  const text = describe(subscription);
  const reminder = subscription.payment_reminder;
  return (
    <>
      <Link
        href={SUBSCRIPTION_PATH}
        aria-label={`${text.label}. ${text.detail}. Open subscription.`}
        title={`${text.label} · ${text.detail}`}
        className={cn(
          "flex h-10 min-w-0 items-center gap-2 rounded-xl border px-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-3",
          TONES[text.tone],
        )}
      >
        <Icon name={text.icon} />
        <span className="text-xs font-semibold whitespace-nowrap md:hidden">{text.short}</span>
        <span className="hidden min-w-0 text-left leading-tight md:block">
          <span className="block max-w-60 truncate text-xs font-semibold">{text.label}</span>
          <span className="block max-w-60 truncate text-[11px] opacity-80">{text.detail}</span>
        </span>
      </Link>
      {reminder && reminder.notify_stage !== null && reminder.due_date && (
        <ReminderNotice reminder={reminder} storageKey={`hp:payment-reminder:${hospitalId}:${reminder.due_date}:${reminder.notify_stage}`} />
      )}
    </>
  );
}

// --- once-per-period notification -------------------------------------------
//
// Each reminder period (7, 3, 1 days before, due day) for a given due date has
// its own key. The notice shows until dismissed or followed; after that the
// same period never shows again in this browser. The first value read on the
// client is kept for this page session, so it doesn't flicker on re-render.

const seenCache = new Map<string, boolean>();
const listeners = new Set<() => void>();

function readSeen(key: string): boolean {
  if (!seenCache.has(key)) {
    let seen = false;
    try {
      seen = window.localStorage.getItem(key) === "1";
    } catch {
      seen = false; // storage blocked: show it, then keep it dismissed for this session
    }
    seenCache.set(key, seen);
  }
  return seenCache.get(key)!;
}

function markSeen(key: string) {
  seenCache.set(key, true);
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // ignore: the in-memory cache still prevents repeats this session
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function ReminderNotice({ reminder, storageKey }: { reminder: Reminder; storageKey: string }) {
  // Server render: treat as seen, so nothing appears until the client checks storage.
  const seen = useSyncExternalStore(subscribe, () => readSeen(storageKey), () => true);
  if (seen) return null;

  const trial = reminder.reason === "trial_ends";
  const what = trial ? "Your free trial" : `Your ${reminder.plan_name} subscription`;
  const when =
    reminder.notify_stage === 0 ? "ends today" : reminder.notify_stage === 1 ? "ends tomorrow" : `ends in ${reminder.days_until_due ?? 0} day${reminder.days_until_due === 1 ? "" : "s"}`;
  const amount = reminder.amount_payable ? ` Pay ${formatMoney(reminder.amount_payable)}` : " Renew";

  return (
    <div
      role="status"
      className="fixed right-4 top-[84px] z-30 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-4 text-sm text-ink shadow-float print:hidden"
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", reminder.notify_stage === 0 ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning")}>
          <BellIcon width={18} height={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Payment reminder</p>
          <p className="mt-1 leading-5 text-muted">
            {what} {when} ({calendarDate(reminder.due_date, longDate)}).{amount} to keep access. Nothing is charged automatically.
          </p>
          <Link
            href={SUBSCRIPTION_PATH}
            onClick={() => markSeen(storageKey)}
            className="mt-3 inline-flex rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            {trial ? "Pay now" : "Renew now"}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => markSeen(storageKey)}
          aria-label="Dismiss reminder"
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-canvas"
        >
          <CloseIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
