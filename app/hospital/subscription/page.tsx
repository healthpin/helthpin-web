import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { getHospitalSubscription, listHospitalPayments } from "@/features/subscriptions/api/subscriptionApi";
import { HospitalSubscription } from "@/features/subscriptions/components/HospitalSubscription";
import { PaymentHistory } from "@/features/subscriptions/components/PaymentHistory";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";
import { requireHospital } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Subscription" };

export default async function SubscriptionPage({ searchParams }: PageProps<"/hospital/subscription">) {
  await requireHospital();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const [state, payments] = await withHospitalToken((token) =>
    Promise.all([getHospitalSubscription(token), listHospitalPayments(token, page)]),
  );
  return (
    <>
      <PageHeader title="Subscription" description="Your Health Pin plan, free trial, renewals and payment receipts." />
      <HospitalSubscription state={state} />
      <section aria-labelledby="payments-heading" className="mt-10">
        <h2 id="payments-heading" className="mb-4 text-xl font-bold text-ink">Payment history</h2>
        <PaymentHistory payments={payments.results} />
        <Pagination
          page={payments.page}
          totalPages={payments.total_pages}
          totalCount={payments.count}
          pageSize={payments.page_size}
          hrefForPage={(next) => (next > 1 ? `/hospital/subscription?page=${next}` : "/hospital/subscription")}
        />
      </section>
    </>
  );
}
