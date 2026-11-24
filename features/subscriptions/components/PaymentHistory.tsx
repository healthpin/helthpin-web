import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReceiptIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils/format";

import { formatDateTime, formatMoney, months } from "../lib/format";
import type { Payment } from "../types/subscription";
import { PaymentStatusBadge } from "./StatusBadge";

export function PaymentHistory({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <Card>
        <EmptyState icon={ReceiptIcon} title="No payments yet" description="Your Razorpay payments and receipts will appear here." />
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      {/* Cards on small screens, a table from md up. */}
      <ul className="divide-y divide-line md:hidden">
        {payments.map((payment) => (
          <li key={payment.id} className="space-y-2 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{payment.plan_name}</p>
                <p className="text-xs text-muted">{formatDateTime(payment.paid_at ?? payment.created_at)}</p>
              </div>
              <PaymentStatusBadge status={payment.status} label={payment.status_label} />
            </div>
            <p className="font-bold text-ink">{formatMoney(payment.amount)}</p>
            {payment.failure_reason && payment.status !== "PAID" && <p className="text-xs text-muted">{payment.failure_reason}</p>}
            <ReceiptLink payment={payment} />
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-low text-xs uppercase tracking-wide text-muted">
            <tr>
              {["Date", "Plan", "Amount", "Period", "Payment ID", "Status", "Receipt"].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {payments.map((payment) => (
              <tr key={payment.id} className="align-top hover:bg-canvas">
                <td className="px-4 py-4 text-muted">{formatDateTime(payment.paid_at ?? payment.created_at)}</td>
                <td className="px-4 py-4 font-semibold text-ink">{payment.plan_name}</td>
                <td className="px-4 py-4 font-semibold text-ink">{formatMoney(payment.amount)}</td>
                <td className="px-4 py-4 text-muted">
                  {payment.period_start && payment.period_end ? `${formatDate(payment.period_start)} – ${formatDate(payment.period_end)}` : "—"}
                  {payment.trial_months > 0 && <p className="mt-1 text-xs">+ {months(payment.trial_months)} free trial first</p>}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-muted">{payment.razorpay_payment_id ?? "—"}</td>
                <td className="px-4 py-4">
                  <PaymentStatusBadge status={payment.status} label={payment.status_label} />
                  {payment.failure_reason && payment.status !== "PAID" && <p className="mt-1 max-w-56 text-xs text-muted">{payment.failure_reason}</p>}
                </td>
                <td className="px-4 py-4"><ReceiptLink payment={payment} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReceiptLink({ payment }: { payment: Payment }) {
  if (payment.status !== "PAID") return <span className="text-xs text-subtle">—</span>;
  return (
    <Link href={`/hospital/subscription/receipts/${payment.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
      <ReceiptIcon width={16} height={16} /> Receipt
    </Link>
  );
}
