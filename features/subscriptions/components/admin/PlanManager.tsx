"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { PlusIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";

import { savePlanAction, setPlanActiveAction } from "../../actions/adminSubscriptionActions";
import { formatMoney, months } from "../../lib/format";
import type { AdminPlan, FormState } from "../../types/subscription";

const initial: FormState = {};

export function PlanManager({ plans }: { plans: AdminPlan[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminPlan | "new" | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  function toggle(plan: AdminPlan) {
    setPendingId(plan.id);
    startTransition(async () => {
      const result = await setPlanActiveAction(plan.id, !plan.is_active);
      setPendingId(null);
      if (result.ok) toast.success(result.message ?? "Saved.");
      else toast.error(result.message ?? "Could not update the plan.");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Hospitals see active plans only. The offer price is the amount charged through Razorpay.
        </p>
        <Button onClick={() => setEditing("new")} leadingIcon={<PlusIcon width={18} height={18} />}>New plan</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col p-5 shadow-card ${plan.is_active ? "" : "opacity-75"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">{plan.name}</h3>
                <p className="text-sm text-muted">{months(plan.duration_months)} · {plan.trial_months > 0 ? `${months(plan.trial_months)} free trial` : "no trial"}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${plan.is_active ? "bg-success-soft text-success" : "bg-surface-high text-muted"}`}>
                {plan.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold text-brand">{formatMoney(plan.offer_price)}</span>
              {plan.discount_percent > 0 && (
                <>
                  <span className="text-sm text-subtle line-through">{formatMoney(plan.original_price)}</span>
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">{plan.discount_percent}% off</span>
                </>
              )}
            </div>
            {plan.description && <p className="mt-3 text-sm leading-6 text-muted">{plan.description}</p>}
            <p className="mt-3 text-xs text-subtle">Updated {formatDate(plan.updated_at)}</p>
            <div className="mt-auto flex gap-2 pt-5">
              <Button size="sm" variant="secondary" onClick={() => setEditing(plan)}>Edit</Button>
              <Button size="sm" variant={plan.is_active ? "danger" : "secondary"} isLoading={pendingId === plan.id} onClick={() => toggle(plan)}>
                {plan.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <PlanDialog
          key={editing === "new" ? "new" : editing.id}
          plan={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function PlanDialog({ plan, onClose, onSaved }: { plan: AdminPlan | null; onClose: () => void; onSaved: () => void }) {
  const [state, action, pending] = useActionState(savePlanAction, initial);
  const [values, setValues] = useState({
    name: plan?.name ?? "",
    duration_months: String(plan?.duration_months ?? 1),
    trial_months: String(plan?.trial_months ?? 0),
    original_price: plan?.original_price ?? "",
    offer_price: plan?.offer_price ?? "",
    description: plan?.description ?? "",
    sort_order: String(plan?.sort_order ?? 0),
    is_active: plan?.is_active ?? true,
  });

  const handled = useRef<FormState | null>(null);
  useEffect(() => {
    if (state.ok && handled.current !== state) {
      handled.current = state;
      toast.success(state.message ?? "Saved.");
      onSaved();
    }
  }, [state, onSaved]);

  const original = Number(values.original_price);
  const offer = Number(values.offer_price);
  const discount = original > 0 && offer > 0 && offer <= original ? Math.floor(((original - offer) * 100) / original) : null;
  const set = (name: keyof typeof values) => (event: { target: { value: string } }) => setValues({ ...values, [name]: event.target.value });
  const error = (name: string) => state.fieldErrors?.[name];

  return (
    <Dialog open onClose={() => !pending && onClose()} title={plan ? `Edit ${plan.name}` : "New subscription plan"} description="Prices are in Indian rupees (₹). Changes apply to new purchases only.">
      <form action={action} noValidate className="space-y-4">
        {state.message && !state.ok && <Alert>{state.message}</Alert>}
        {plan && <input type="hidden" name="id" value={plan.id} />}
        <TextField label="Plan name" name="name" value={values.name} onChange={set("name")} error={error("name")} maxLength={80} required disabled={pending} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Subscription duration (months)" name="duration_months" type="number" inputMode="numeric" min={1} max={60} value={values.duration_months} onChange={set("duration_months")} error={error("duration_months")} disabled={pending} />
          <TextField label="Free trial (months)" name="trial_months" type="number" inputMode="numeric" min={0} max={24} value={values.trial_months} onChange={set("trial_months")} error={error("trial_months")} hint="0 for no trial" disabled={pending} />
          <TextField label="Original price (₹)" name="original_price" type="number" inputMode="decimal" min={1} step="0.01" value={values.original_price} onChange={set("original_price")} error={error("original_price")} disabled={pending} />
          <TextField label="Offer price (₹)" name="offer_price" type="number" inputMode="decimal" min={1} step="0.01" value={values.offer_price} onChange={set("offer_price")} error={error("offer_price")} hint={discount !== null ? `${discount}% discount · charged via Razorpay` : "Charged via Razorpay"} disabled={pending} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plan-description" className="text-sm font-medium text-ink">Plan description</label>
          <textarea id="plan-description" name="description" rows={3} maxLength={1000} value={values.description} onChange={set("description")} disabled={pending} className="rounded-xl border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
          {error("description") && <p className="text-sm text-danger">{error("description")}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <TextField label="Display order" name="sort_order" type="number" min={0} max={999} value={values.sort_order} onChange={set("sort_order")} error={error("sort_order")} disabled={pending} />
          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 text-sm font-medium text-ink">
            <input type="checkbox" name="is_active" checked={values.is_active} onChange={(event) => setValues({ ...values, is_active: event.target.checked })} disabled={pending} className="size-4 accent-brand" />
            Active (visible to hospitals)
          </label>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" isLoading={pending}>{plan ? "Save plan" : "Create plan"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
