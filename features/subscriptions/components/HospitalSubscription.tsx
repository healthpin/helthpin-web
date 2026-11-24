"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { CreditCardIcon, ShieldIcon } from "@/components/ui/icons";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";

import {
  createOrderAction,
  refreshPaymentAction,
  reportFailureAction,
  startTrialAction,
  verifyPaymentAction,
} from "../actions/hospitalSubscriptionActions";
import { formatMoney, months } from "../lib/format";
import { openCheckout } from "../lib/razorpayCheckout";
import type { HospitalSubscriptionState, Plan, SubscriptionSummary } from "../types/subscription";
import { PlanCard } from "./PlanCard";
import { SubscriptionStatusBadge } from "./StatusBadge";

type Intent = { plan: Plan; kind: "trial" | "pay" };

/** When a payment made now would start (computed by the backend). */
function paidPeriodStart(sub: SubscriptionSummary): string {
  const start = Date.parse(sub.next_payment_starts_at);
  const trialEnd = sub.trial_ends_at ? Date.parse(sub.trial_ends_at) : NaN;
  const periodEnd = sub.current_period_end ? Date.parse(sub.current_period_end) : NaN;
  if (start === periodEnd && sub.paid_ahead) return `${formatDate(sub.next_payment_starts_at)}, when your current period ends`;
  if (start === trialEnd && sub.status === "TRIAL_ACTIVE") return `${formatDate(sub.next_payment_starts_at)}, when your free trial ends`;
  return "today";
}

export function HospitalSubscription({ state }: { state: HospitalSubscriptionState }) {
  const router = useRouter();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, startRefresh] = useTransition();
  const { subscription: sub, plans, payments_enabled: paymentsEnabled, pending_payment: pending } = state;

  const noSubscription = sub.status === null && sub.trial_available;
  const hasPaidAhead = sub.paid_ahead;
  const trialEligible = sub.trial_available;

  function choose(plan: Plan) {
    setError("");
    setIntent({ plan, kind: sub.trial_available && plan.trial_months > 0 ? "trial" : "pay" });
  }

  async function confirm() {
    if (!intent) return;
    setBusy(true);
    setError("");
    try {
      if (intent.kind === "trial") {
        const result = await startTrialAction(intent.plan.id);
        if (!result.ok) return setError(result.error);
        toast.success(result.message);
        setIntent(null);
        router.refresh();
        return;
      }
      const order = await createOrderAction(intent.plan.id);
      if (!order.ok) return setError(order.error);
      setIntent(null);
      const outcome = await openCheckout(order.checkout, (reason) => {
        void reportFailureAction(order.checkout.order_id, reason);
      });
      if (outcome.kind === "paid") {
        const verified = await verifyPaymentAction(outcome.response);
        if (verified.ok) {
          if (verified.payment.status === "PAID") toast.success(verified.message);
          else toast.error(verified.message);
        } else {
          toast.error(verified.error);
        }
      } else if (outcome.kind === "failed") {
        toast.error(`Payment failed: ${outcome.reason}`);
      }
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function checkPending() {
    if (!pending) return;
    startRefresh(async () => {
      const result = await refreshPaymentAction(pending.id);
      if (!result.ok) toast.error(result.error);
      else if (result.payment.status === "PAID") toast.success("Payment confirmed. Your subscription is updated.");
      else toast.success("Still waiting for Razorpay to confirm this payment.");
      router.refresh();
    });
  }

  /** Moving to a different plan than the current one (no trial, full offer price). */
  const isSwitch = (plan: Plan) => Boolean(sub.plan && sub.plan.id !== plan.id);

  /** Offers the one-time free trial on this plan (decided by the backend's trial_available). */
  const offersTrial = (plan: Plan) => trialEligible && plan.trial_months > 0;

  function actionLabel(plan: Plan): string {
    if (offersTrial(plan)) return "Start Free Trial";
    if (noSubscription) return "Subscribe Now";
    if (sub.plan?.id === plan.id && (sub.has_access || hasPaidAhead)) return "Renew";
    if (sub.plan && plan.duration_months > sub.plan.duration_months) return "Upgrade";
    if (isSwitch(plan)) return "Switch plan";
    return "Subscribe Now";
  }

  return (
    <div className="space-y-8">
      {state.payment_mode === "test" && (
        <Alert tone="info">Payments are in test mode. Use Razorpay test cards or UPI; no real money is charged.</Alert>
      )}

      {noSubscription ? <ActivationHero /> : <StatusPanel sub={sub} />}

      <TrialEligibility sub={sub} />

      <PaymentDue
        sub={sub}
        plan={plans.find((item) => item.id === sub.plan?.id) ?? null}
        paymentsEnabled={paymentsEnabled}
        busy={busy}
        onPay={choose}
      />

      <Notices sub={sub} pendingCount={pending ? 1 : 0} onCheck={checkPending} checking={refreshing} hasPaidAhead={hasPaidAhead} />

      <section aria-labelledby="plans-heading">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="plans-heading" className="text-xl font-bold text-ink">
              {noSubscription ? "Choose a plan" : "Plans"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {trialEligible
                ? "Your first plan starts with its free trial. No payment details are needed to start."
                : "Renew, upgrade or switch at any time at the full offer price. New time is added after your current period, so you never lose days."}
            </p>
          </div>
        </div>
        {plans.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted">No plans are available right now. Please contact Health Pin support.</Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = sub.plan?.id === plan.id && sub.status !== null;
              const needsPayment = !(sub.trial_available && plan.trial_months > 0);
              const best = plans.reduce((a, b) => (b.discount_percent > a.discount_percent ? b : a), plans[0]);
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  trialEligible={trialEligible}
                  highlighted={isCurrent || (noSubscription && plan.id === best.id)}
                  badge={
                    isCurrent ? (
                      <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">Current plan</span>
                    ) : noSubscription && plan.id === best.id ? (
                      <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-ink">Best value</span>
                    ) : undefined
                  }
                  footer={
                    <>
                      <Button
                        fullWidth
                        size="lg"
                        variant={isCurrent || noSubscription ? "primary" : "secondary"}
                        onClick={() => choose(plan)}
                        disabled={busy || (needsPayment && !paymentsEnabled)}
                      >
                        {actionLabel(plan)}
                      </Button>
                      <p className="mt-2 text-center text-xs text-muted">
                        {!needsPayment
                          ? `Free for ${months(plan.trial_months)}, then ${formatMoney(plan.offer_price)}`
                          : !paymentsEnabled
                            ? "Online payment is not available yet"
                            : !trialEligible
                              ? `Full offer price payable: ${formatMoney(plan.offer_price)} · no free trial`
                              : `Pay ${formatMoney(plan.offer_price)} securely with Razorpay`}
                      </p>
                    </>
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        open={Boolean(intent)}
        onClose={() => !busy && setIntent(null)}
        title={
          intent?.kind === "trial"
            ? `Start Your ${intent.plan.name} Free Trial`
            : intent && isSwitch(intent.plan)
              ? `Switch to ${intent.plan.name}`
              : `Pay for ${intent?.plan.name ?? "plan"}`
        }
        description={intent ? `${months(intent.plan.duration_months)} plan · ${formatMoney(intent.plan.offer_price)}` : undefined}
      >
        {intent && (
          <div className="space-y-5">
            {error && <Alert>{error}</Alert>}
            {intent.kind === "trial" ? (
              <ul className="space-y-3 text-sm leading-6 text-muted">
                <li>
                  Your <strong className="text-ink">{months(intent.plan.trial_months)} free trial</strong> starts today. Nothing is charged and no card is needed.
                </li>
                <li>
                  To keep access after the trial, pay <strong className="text-ink">{formatMoney(intent.plan.offer_price)}</strong> for {months(intent.plan.duration_months)} before it ends. You can pay early: paid time starts when the trial ends.
                </li>
                <li>We never charge automatically. If you don&apos;t pay, access simply pauses when the trial ends.</li>
                <li>A hospital can use the free trial only once.</li>
                <li>
                  Prefer to pay now? <strong className="text-ink">Continue with Subscription</strong>: pay {formatMoney(intent.plan.offer_price)} and get your {months(intent.plan.trial_months)} free trial plus {months(intent.plan.duration_months)} paid ({months(intent.plan.trial_months + intent.plan.duration_months)} in total). Your trial is only used once that payment goes through.
                </li>
              </ul>
            ) : (
              <div className="space-y-3 text-sm leading-6 text-muted">
                <div className="rounded-xl border border-line bg-surface-low p-4">
                  <div className="flex justify-between gap-3"><span>Plan</span><span className="font-semibold text-ink">{intent.plan.name}</span></div>
                  {offersTrial(intent.plan) ? (
                    <>
                      <div className="mt-1 flex justify-between gap-3"><span>Free trial</span><span className="text-right text-ink">{months(intent.plan.trial_months)}, from the day payment is confirmed</span></div>
                      <div className="mt-1 flex justify-between gap-3"><span>Paid period</span><span className="text-right text-ink">{months(intent.plan.duration_months)}, after the free trial</span></div>
                      <div className="mt-1 flex justify-between gap-3"><span>Total validity</span><span className="font-semibold text-ink">{months(intent.plan.trial_months + intent.plan.duration_months)}</span></div>
                    </>
                  ) : (
                    <>
                      <div className="mt-1 flex justify-between gap-3"><span>Duration</span><span className="text-ink">{months(intent.plan.duration_months)}</span></div>
                      <div className="mt-1 flex justify-between gap-3"><span>Starts</span><span className="text-right text-ink">{paidPeriodStart(sub)}</span></div>
                      <div className="mt-1 flex justify-between gap-3"><span>Free trial</span><span className="text-ink">{trialEligible ? "None for this plan" : "None (already used)"}</span></div>
                    </>
                  )}
                  <div className="mt-3 flex justify-between gap-3 border-t border-line pt-3"><span>Original price</span><span className="text-subtle line-through">{formatMoney(intent.plan.original_price)}</span></div>
                  <div className="mt-1 flex justify-between gap-3"><span>Offer price{intent.plan.discount_percent > 0 ? ` (${intent.plan.discount_percent}% off)` : ""}</span><span className="text-ink">{formatMoney(intent.plan.offer_price)}</span></div>
                  <div className="mt-3 flex justify-between gap-3 border-t border-line pt-3 text-base"><span className="font-semibold text-ink">Amount payable</span><span className="font-bold text-brand">{formatMoney(intent.plan.offer_price)}</span></div>
                </div>
                {offersTrial(intent.plan) ? (
                  <Alert tone="info">
                    Your {months(intent.plan.trial_months)} free trial is included: after Razorpay confirms the payment, access runs for {months(intent.plan.trial_months + intent.plan.duration_months)} ({months(intent.plan.trial_months)} free + {months(intent.plan.duration_months)} paid). This uses your one-time free trial; renewals and plan changes won&apos;t include another one. If you close or cancel the payment, nothing changes.
                  </Alert>
                ) : trialEligible ? (
                  <Alert tone="info">This plan has no free trial. Paying for it uses up your hospital&apos;s one-time free trial.</Alert>
                ) : null}
                {!trialEligible && isSwitch(intent.plan) && (
                  <p>Switching plans doesn&apos;t include a free trial. No trial days are added; the full offer price is charged.</p>
                )}
                <p>
                  This is a one-time payment of {formatMoney(intent.plan.offer_price)} through Razorpay. It does not renew automatically; you&apos;ll see a reminder here before it ends.
                </p>
              </div>
            )}
            {intent.kind === "trial" ? (
              <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 [&>button]:w-full [&>button]:whitespace-nowrap">
                <Button variant="ghost" onClick={() => setIntent(null)} disabled={busy}>
                  Not Now
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setError(""); setIntent({ plan: intent.plan, kind: "pay" }); }}
                  disabled={busy || !paymentsEnabled}
                  title={!paymentsEnabled ? "Online payment is not available yet" : undefined}
                  leadingIcon={<CreditCardIcon width={18} height={18} />}
                >
                  Continue with Subscription
                </Button>
                <Button onClick={confirm} isLoading={busy}>
                  Start Free Trial
                </Button>
              </div>
            ) : (
              <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 [&>button]:w-full [&>button]:whitespace-nowrap">
                <Button variant="ghost" onClick={() => setIntent(null)} disabled={busy}>
                  Not Now
                </Button>
                {offersTrial(intent.plan) && (
                  <Button variant="secondary" onClick={() => { setError(""); setIntent({ plan: intent.plan, kind: "trial" }); }} disabled={busy}>
                    Use free trial instead
                  </Button>
                )}
                <Button onClick={confirm} isLoading={busy} disabled={!paymentsEnabled} leadingIcon={<CreditCardIcon width={18} height={18} />}>
                  {`Pay ${formatMoney(intent.plan.offer_price)}`}
                </Button>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

const DUE_STATES = new Set(["due_soon", "due_today", "overdue", "expired"]);

/** Shown when the backend says payment is due: the plan, the amount and a Pay/Renew button. */
function PaymentDue({
  sub,
  plan,
  paymentsEnabled,
  busy,
  onPay,
}: {
  sub: SubscriptionSummary;
  plan: Plan | null;
  paymentsEnabled: boolean;
  busy: boolean;
  onPay: (plan: Plan) => void;
}) {
  const reminder = sub.payment_reminder;
  if (!reminder || !DUE_STATES.has(reminder.state)) return null;
  const days = reminder.days_until_due ?? 0;
  const heading =
    reminder.state === "due_soon"
      ? `Payment due in ${days} day${days === 1 ? "" : "s"}`
      : reminder.state === "due_today"
        ? "Payment due today"
        : reminder.state === "expired"
          ? "Your subscription has expired"
          : "Payment overdue";
  const urgent = reminder.state !== "due_soon";
  return (
    <Card className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${urgent ? "border-danger/25 bg-danger-soft/40" : "border-warning/30 bg-warning-soft/50"}`}>
      <div>
        <h2 className={`text-lg font-bold ${urgent ? "text-danger" : "text-warning"}`}>{heading}</h2>
        <p className="mt-1 text-sm text-muted">
          {reminder.due_at && `Due date: ${formatDate(reminder.due_at)} · `}
          Plan: <strong className="text-ink">{reminder.plan_name}</strong>
          {reminder.amount_payable && (
            <>
              {" "}· Amount payable: <strong className="text-ink">{formatMoney(reminder.amount_payable)}</strong>
            </>
          )}
        </p>
        {!plan && <p className="mt-1 text-sm text-muted">This plan is no longer offered. Choose one of the plans below.</p>}
      </div>
      {plan && (
        <Button size="lg" onClick={() => onPay(plan)} disabled={busy || !paymentsEnabled} leadingIcon={<CreditCardIcon width={18} height={18} />}>
          {reminder.state === "expired" || reminder.reason === "renewal" ? "Renew" : "Pay Now"} · {formatMoney(plan.offer_price)}
        </Button>
      )}
    </Card>
  );
}

function TrialEligibility({ sub }: { sub: SubscriptionSummary }) {
  if (sub.trial_available) {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-2xl border border-accent/60 bg-accent-soft p-4 text-sm text-accent-ink sm:flex-row sm:items-center sm:gap-3">
        <span className="w-fit shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold">Free trial available</span>
        <p>Your hospital&apos;s first plan starts with its free trial. A hospital gets one free trial only, so later plan changes are paid in full.</p>
      </div>
    );
  }
  return (
    <div role="status" className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-low p-4 text-sm text-muted sm:flex-row sm:items-center sm:gap-3">
      <span className="w-fit shrink-0 rounded-full bg-surface-high px-2.5 py-1 text-xs font-bold text-ink">No free trial available</span>
      <p>
        Your hospital {sub.trial_used_at ? `used its one-time free trial on ${formatDate(sub.trial_used_at)}` : "has already used its one-time free trial"}.
        Renewing or switching between Monthly, Half-Yearly and Yearly is charged at the full offer price, with no trial days.
      </p>
    </div>
  );
}

function ActivationHero() {
  return (
    <Card className="overflow-hidden border-brand/20 bg-brand-soft/60 p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-[0_0_0_4px_var(--color-accent-soft)]">
          <ShieldIcon width={26} height={26} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">Activate your Health Pin subscription</h2>
          <p className="mt-1.5 max-w-[65ch] text-sm leading-6 text-muted">
            Your hospital doesn&apos;t have a subscription yet. Pick a plan below to start its free trial today: no payment now, and nothing is ever charged without your confirmation.
          </p>
        </div>
      </div>
    </Card>
  );
}

function StatusPanel({ sub }: { sub: SubscriptionSummary }) {
  const inTrial = sub.status === "TRIAL_ACTIVE";
  const total = inTrial && sub.trial_started_at && sub.trial_ends_at
    ? Date.parse(sub.trial_ends_at) - Date.parse(sub.trial_started_at)
    : sub.current_period_start && sub.current_period_end
      ? Date.parse(sub.current_period_end) - Date.parse(sub.current_period_start)
      : 0;
  const daysShown = inTrial ? sub.trial_remaining_days : sub.remaining_days;
  const percent = total > 0 && sub.has_access ? Math.min(100, Math.max(2, (daysShown * 86_400_000 * 100) / total)) : 0;

  return (
    <Card className="p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">Current subscription</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">{sub.plan?.name ?? "No plan"}</h2>
        </div>
        <SubscriptionStatusBadge status={sub.status} label={sub.status_label} />
      </div>

      {sub.has_access && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-ink">
              {daysShown} day{daysShown === 1 ? "" : "s"} {inTrial ? "of free trial" : ""} left
            </span>
            {sub.remaining_days !== daysShown && <span className="text-muted">{sub.remaining_days} days of access in total</span>}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-high" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-label="Time remaining">
            <div className={`h-full rounded-full ${inTrial ? "bg-accent" : "bg-brand"}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Trial started" value={sub.trial_started_at ? formatDate(sub.trial_started_at) : "—"} />
        <Fact label="Trial ends" value={sub.trial_ends_at ? formatDate(sub.trial_ends_at) : "—"} />
        <Fact label="Subscription start" value={sub.current_period_start ? formatDate(sub.current_period_start) : "Not paid yet"} />
        <Fact label="Expiry date" value={sub.access_ends_at ? formatDate(sub.access_ends_at) : sub.current_period_end ? formatDate(sub.current_period_end) : "—"} />
      </dl>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-low px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Notices({
  sub,
  pendingCount,
  onCheck,
  checking,
  hasPaidAhead,
}: {
  sub: SubscriptionSummary;
  pendingCount: number;
  onCheck: () => void;
  checking: boolean;
  hasPaidAhead: boolean;
}) {
  const notices: ReactNode[] = [];
  if (!sub.has_access) {
    notices.push(
      <Alert key="locked" tone="info">
        Overview, Bookings, Doctors and Live Queue are locked until {sub.trial_available ? "you start your free trial or " : ""}a payment is confirmed. Payment history, receipts and Profile &amp; Settings stay available.
      </Alert>,
    );
  }
  if (pendingCount > 0) {
    notices.push(
      <div key="pending" className="flex flex-col gap-3 rounded-xl border border-warning/25 bg-warning-soft p-4 text-sm text-warning sm:flex-row sm:items-center sm:justify-between" role="status">
        <p>A payment is waiting for confirmation from Razorpay. This usually takes a few minutes; you won&apos;t be charged twice.</p>
        <Button size="sm" variant="secondary" onClick={onCheck} isLoading={checking}>Check status</Button>
      </div>,
    );
  }
  if (sub.status === "TRIAL_ACTIVE" && !hasPaidAhead && sub.trial_ends_at) {
    notices.push(
      <Alert key="trial" tone="info">
        Your free trial ends on {formatDate(sub.trial_ends_at)} ({sub.trial_remaining_days} day{sub.trial_remaining_days === 1 ? "" : "s"} left). To keep access, pay for a plan before then. You will not be charged automatically.
      </Alert>,
    );
  }
  if (sub.status === "TRIAL_ACTIVE" && hasPaidAhead && sub.current_period_start) {
    notices.push(<Alert key="queued" tone="info">Payment received. Your paid subscription starts on {formatDate(sub.current_period_start)}, when the free trial ends.</Alert>);
  }
  if (sub.status === "ACTIVE" && sub.remaining_days <= 7) {
    notices.push(<Alert key="renew" tone="info">Your subscription ends in {sub.remaining_days} day{sub.remaining_days === 1 ? "" : "s"}. Renew now to avoid an interruption.</Alert>);
  }
  if (sub.status === "PAYMENT_PENDING" && pendingCount === 0) {
    notices.push(<Alert key="due">{sub.trial_ends_at ? "Your free trial has ended." : "Your subscription is not active."} Payment is required to continue: choose a plan below.</Alert>);
  }
  if (sub.status === "PAYMENT_FAILED") {
    notices.push(<Alert key="failed">Your last payment failed and your subscription is not active. Please try again; if money was deducted, Razorpay will confirm or refund it automatically.</Alert>);
  }
  if (sub.status === "EXPIRED") {
    notices.push(<Alert key="expired">Your subscription expired{sub.current_period_end ? ` on ${formatDate(sub.current_period_end)}` : ""}. Renew to restore access.</Alert>);
  }
  if (sub.status === "CANCELLED") {
    notices.push(<Alert key="cancelled">This subscription was cancelled by Health Pin{sub.cancellation_reason ? `: ${sub.cancellation_reason}` : ""}. Subscribe again to restore access, or contact support.</Alert>);
  }
  return notices.length ? <div className="space-y-3">{notices}</div> : null;
}
