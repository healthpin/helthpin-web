import { formatDate } from "@/lib/utils/format";

import { formatDateTime, formatMoney, months } from "../../lib/format";
import type { AdminPayment } from "../../types/subscription";
import { PaymentStatusBadge } from "../StatusBadge";

export function PaymentsTable({ rows }: { rows: AdminPayment[] }) {
  if (rows.length === 0) return <div className="p-10 text-center text-sm text-muted">No payments yet.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="bg-surface-low text-xs uppercase tracking-wide text-muted">
          <tr>
            {["Date", "Hospital", "Plan", "Amount", "Status", "Receipt / IDs", "Period"].map((heading) => (
              <th key={heading} scope="col" className="px-4 py-3 font-semibold">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id} className="align-top hover:bg-canvas">
              <td className="px-4 py-4 text-muted">{formatDateTime(row.paid_at ?? row.created_at)}</td>
              <td className="px-4 py-4 font-semibold text-ink">{row.hospital_name}</td>
              <td className="px-4 py-4 text-ink">{row.plan_name}</td>
              <td className="px-4 py-4 font-semibold text-ink">
                {formatMoney(row.amount)}
                {row.mode === "test" && <span className="ml-2 rounded bg-surface-high px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted">Test</span>}
              </td>
              <td className="px-4 py-4">
                <PaymentStatusBadge status={row.status} label={row.status_label} />
                {row.failure_reason && row.status !== "PAID" && <p className="mt-1 max-w-56 text-xs text-muted">{row.failure_reason}</p>}
              </td>
              <td className="px-4 py-4 font-mono text-xs text-muted">
                <p className="text-ink">{row.receipt_number}</p>
                <p>{row.razorpay_order_id}</p>
                {row.razorpay_payment_id && <p>{row.razorpay_payment_id}</p>}
              </td>
              <td className="px-4 py-4 text-muted">
                {row.period_start && row.period_end ? `${formatDate(row.period_start)} – ${formatDate(row.period_end)}` : "—"}
                  {row.trial_months > 0 && <p className="mt-1 text-xs">+ {months(row.trial_months)} free trial first</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
