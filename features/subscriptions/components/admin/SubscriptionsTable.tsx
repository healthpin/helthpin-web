"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";

import { subscriptionAction } from "../../actions/adminSubscriptionActions";
import { formatMoney } from "../../lib/format";
import type { AdminSubscriptionRow } from "../../types/subscription";
import { PaymentStatusBadge, SubscriptionStatusBadge } from "../StatusBadge";

const date = (value: string | null) => (value ? formatDate(value) : "—");

export function SubscriptionsTable({ rows }: { rows: AdminSubscriptionRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<AdminSubscriptionRow | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "cancel" | "reinstate") {
    if (!selected?.subscription_id) return;
    setBusy(true);
    setError("");
    const result = await subscriptionAction(selected.subscription_id, action, reason);
    setBusy(false);
    if (!result.ok) return setError(result.message ?? "Could not update this subscription.");
    toast.success(result.message ?? "Saved.");
    setSelected(null);
    setReason("");
    router.refresh();
  }

  if (rows.length === 0) return <div className="p-10 text-center text-sm text-muted">No hospitals match these filters.</div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-surface-low text-xs uppercase tracking-wide text-muted">
            <tr>
              {["Hospital", "Plan", "Status", "Trial", "Start date", "Expiry date", "Last payment", ""].map((heading, index) => (
                <th key={index} scope="col" className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.hospital_id} className="align-top hover:bg-canvas">
                <td className="px-4 py-4">
                  <p className="font-semibold text-ink">{row.hospital_name}</p>
                  <p className="text-xs text-muted">{row.hospital_email}{!row.hospital_active && " · account disabled"}</p>
                </td>
                <td className="px-4 py-4 text-ink">{row.plan?.name ?? "—"}</td>
                <td className="px-4 py-4">
                  <SubscriptionStatusBadge status={row.status} label={row.status_label} />
                  {row.has_access && <p className="mt-1 text-xs text-muted">{row.remaining_days} days left</p>}
                </td>
                <td className="px-4 py-4 text-muted">
                  {row.trial_started_at
                    ? `${date(row.trial_started_at)} – ${date(row.trial_ends_at)}`
                    : row.trial_available
                      ? "Eligible"
                      : "Forfeited (paid first)"}
                </td>
                <td className="px-4 py-4 text-muted">{date(row.current_period_start)}</td>
                <td className="px-4 py-4 text-muted">{date(row.access_ends_at ?? row.current_period_end)}</td>
                <td className="px-4 py-4">
                  {row.last_payment ? (
                    <div className="space-y-1">
                      <PaymentStatusBadge status={row.last_payment.status} label={row.last_payment.status_label} />
                      <p className="text-xs text-muted">{formatMoney(row.last_payment.amount)} · {date(row.last_payment.paid_at ?? row.last_payment.created_at)}</p>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  {row.subscription_id && (
                    <Button size="sm" variant="secondary" onClick={() => { setSelected(row); setError(""); setReason(""); }}>
                      Manage
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(selected)} onClose={() => !busy && setSelected(null)} title={selected?.hospital_name ?? "Subscription"} description={selected ? `${selected.plan?.name ?? "No plan"} · ${selected.status_label}` : undefined}>
        {selected && (
          <div className="space-y-5">
            {error && <Alert>{error}</Alert>}
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Trial" value={selected.trial_started_at ? `${date(selected.trial_started_at)} – ${date(selected.trial_ends_at)}` : selected.trial_available ? "Eligible" : "Forfeited (paid first)"} />
              <Detail label="Paid period" value={selected.current_period_start ? `${date(selected.current_period_start)} – ${date(selected.current_period_end)}` : "Not paid"} />
              <Detail label="Access until" value={date(selected.access_ends_at)} />
              <Detail label="Remaining" value={`${selected.remaining_days} days`} />
            </dl>
            {selected.status === "CANCELLED" ? (
              <div className="space-y-3 border-t border-line pt-4">
                {selected.cancellation_reason && <p className="text-sm text-muted">Reason: {selected.cancellation_reason}</p>}
                <p className="text-sm text-muted">Reinstating restores the hospital&apos;s trial and paid dates as they were.</p>
                <Button onClick={() => act("reinstate")} isLoading={busy}>Reinstate subscription</Button>
              </div>
            ) : (
              <div className="space-y-3 border-t border-line pt-4">
                <p className="text-sm text-muted">
                  Cancelling ends this hospital&apos;s access immediately. No refund is issued automatically; handle refunds in the Razorpay Dashboard.
                </p>
                <TextField label="Reason (shown to the hospital)" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} disabled={busy} />
                <Button variant="danger" onClick={() => act("cancel")} isLoading={busy}>Cancel subscription</Button>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
