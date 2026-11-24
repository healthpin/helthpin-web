import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

import { formatMoney, months } from "../lib/format";
import type { Plan } from "../types/subscription";

/** Pricing card shared by the hospital page and the Super Admin preview. */
export function PlanCard({
  plan,
  highlighted = false,
  trialEligible = true,
  badge,
  footer,
}: {
  plan: Plan;
  highlighted?: boolean;
  /** False once the hospital has used its one-time trial: the plan is paid in full. */
  trialEligible?: boolean;
  badge?: ReactNode;
  footer?: ReactNode;
}) {
  const perMonth = Number(plan.offer_price) / plan.duration_months;
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col p-5 sm:p-6",
        highlighted ? "border-brand shadow-float ring-1 ring-brand/30" : "shadow-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">{plan.name}</h3>
          <p className="mt-0.5 text-sm text-muted">{months(plan.duration_months)} subscription</p>
        </div>
        {badge}
      </div>

      <div className="mt-5">
        {plan.discount_percent > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-subtle line-through" aria-label={`Original price ${formatMoney(plan.original_price)}`}>
              {formatMoney(plan.original_price)}
            </span>
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
              {plan.discount_percent}% off
            </span>
          </div>
        )}
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[2rem] font-bold leading-none tracking-[-0.03em] text-brand">{formatMoney(plan.offer_price)}</span>
          <span className="text-sm text-muted">/ {months(plan.duration_months)}</span>
        </p>
        {plan.duration_months > 1 && (
          <p className="mt-1 text-xs text-muted">≈ {formatMoney(perMonth.toFixed(0))} per month</p>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Dot /> {months(plan.duration_months)} of full hospital workspace access
        </li>
        <li className="flex items-center gap-2">
          <Dot />
          {plan.trial_months > 0 && trialEligible ? (
            <span>
              <strong className="font-semibold text-ink">{months(plan.trial_months)} free trial</strong> for your first plan
            </span>
          ) : plan.trial_months > 0 ? (
            <span>
              <span className="text-subtle line-through">{months(plan.trial_months)} free trial</span>{" "}
              <span className="text-muted">· not available (already used)</span>
            </span>
          ) : (
            "No free trial"
          )}
        </li>
      </ul>
      {plan.description && <p className="mt-4 text-sm leading-6 text-muted">{plan.description}</p>}
      {footer && <div className="mt-auto pt-6">{footer}</div>}
    </Card>
  );
}

function Dot() {
  return <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />;
}
