import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { getReceipt } from "@/features/subscriptions/api/subscriptionApi";
import { PrintButton } from "@/features/subscriptions/components/PrintButton";
import { formatDateTime, formatMoney, months } from "@/features/subscriptions/lib/format";
import { DjangoApiError } from "@/lib/api/django";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";
import { requireHospital } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Payment receipt" };

export default async function ReceiptPage({ params }: PageProps<"/hospital/subscription/receipts/[id]">) {
  await requireHospital();
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) notFound();
  const receipt = await withHospitalToken((token) => getReceipt(token, id)).catch((error: unknown) => {
    if (error instanceof DjangoApiError && error.status === 404) notFound();
    throw error;
  });
  const discount = Number(receipt.original_price) - Number(receipt.amount);

  return (
    <div className="receipt-page mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/hospital/subscription" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
          <ArrowLeftIcon width={18} height={18} /> Back to subscription
        </Link>
        <PrintButton />
      </div>

      <Card className="p-6 sm:p-10 print:border-0 print:p-0">
        <div className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
          <Logo caption="Hospital subscription" />
          <div className="sm:text-right">
            <h1 className="text-2xl font-bold text-ink">Payment receipt</h1>
            <p className="mt-1 font-mono text-sm text-muted">{receipt.receipt_number}</p>
            <span className="mt-2 inline-flex rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">PAID</span>
          </div>
        </div>

        <div className="grid gap-6 border-b border-line py-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Billed to</p>
            <p className="mt-2 font-semibold text-ink">{receipt.billed_to.name}</p>
            {receipt.billed_to.address && <p className="mt-1 leading-6 text-muted">{receipt.billed_to.address}</p>}
            <p className="mt-1 text-muted">{receipt.billed_to.email}</p>
          </div>
          <dl className="space-y-2 sm:text-right">
            <Row label="Paid on" value={formatDateTime(receipt.paid_at)} />
            <Row label="Payment ID" value={receipt.razorpay_payment_id ?? "—"} mono />
            <Row label="Order ID" value={receipt.razorpay_order_id} mono />
            {receipt.method && <Row label="Method" value={receipt.method.toUpperCase()} />}
          </dl>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-subtle">
            <tr>
              <th scope="col" className="pb-3 font-semibold">Description</th>
              <th scope="col" className="pb-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line">
              <td className="py-4">
                <p className="font-semibold text-ink">Health Pin {receipt.plan_name} subscription</p>
                <p className="mt-1 text-muted">
                  {months(receipt.duration_months)} paid
                  {receipt.period_start && receipt.period_end && ` · ${formatDate(receipt.period_start)} – ${formatDate(receipt.period_end)}`}
                </p>
                {receipt.trial_months > 0 && (
                  <p className="mt-1 text-muted">
                    Includes {months(receipt.trial_months)} free trial (no charge)
                    {receipt.trial_start && receipt.trial_end && ` · ${formatDate(receipt.trial_start)} – ${formatDate(receipt.trial_end)}`}
                  </p>
                )}
              </td>
              <td className="py-4 text-right text-ink">{formatMoney(receipt.original_price)}</td>
            </tr>
            {discount > 0 && (
              <tr>
                <td className="pb-4 text-muted">Offer discount</td>
                <td className="pb-4 text-right text-success">−{formatMoney(discount.toFixed(2))}</td>
              </tr>
            )}
            <tr className="border-t-2 border-ink/80">
              <td className="pt-4 text-base font-bold text-ink">Total paid ({receipt.currency})</td>
              <td className="pt-4 text-right text-base font-bold text-ink">{formatMoney(receipt.amount)}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-10 border-t border-line pt-5 text-xs leading-5 text-muted">
          Paid online through Razorpay{receipt.mode === "test" ? " (TEST MODE, no money was charged)" : ""}. This is a computer-generated payment receipt from {receipt.issuer.name} and does not need a signature.
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</dt>
      <dd className={mono ? "mt-0.5 break-all font-mono text-xs text-ink" : "mt-0.5 text-ink"}>{value}</dd>
    </div>
  );
}
