import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { listPayments, listPlans, listSubscriptions } from "@/features/subscriptions/api/subscriptionApi";
import { PaymentsTable } from "@/features/subscriptions/components/admin/PaymentsTable";
import { PlanManager } from "@/features/subscriptions/components/admin/PlanManager";
import { SubscriptionsTable } from "@/features/subscriptions/components/admin/SubscriptionsTable";
import { withAdminToken } from "@/lib/auth/adminRequest";
import { requireSuperAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Subscription Management" };

const TABS = [
  { id: "plans", label: "Plans & pricing" },
  { id: "hospitals", label: "Hospital subscriptions" },
  { id: "payments", label: "Payments" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const STATUS_FILTERS = [
  ["", "All"],
  ["TRIAL_ACTIVE", "Trial Active"],
  ["ACTIVE", "Active"],
  ["PAYMENT_PENDING", "Payment Pending"],
  ["PAYMENT_FAILED", "Payment Failed"],
  ["EXPIRED", "Expired"],
  ["CANCELLED", "Cancelled"],
  ["NONE", "Not subscribed"],
] as const;

const PAYMENT_FILTERS = [["", "All"], ["PAID", "Paid"], ["PENDING", "Pending"], ["FAILED", "Failed"], ["CREATED", "Checkout opened"]] as const;

function href(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || (key === "page" && Number(value) <= 1) || (key === "tab" && value === "plans")) continue;
    qs.set(key, String(value));
  }
  return `/subscriptions${qs.toString() ? `?${qs}` : ""}`;
}

export default async function SubscriptionsPage({ searchParams }: PageProps<"/subscriptions">) {
  await requireSuperAdmin();
  const params = await searchParams;
  const read = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const tab: Tab = TABS.some((item) => item.id === read("tab")) ? (read("tab") as Tab) : "plans";
  const status = read("status");
  const search = read("search");
  const page = Math.max(1, Number(read("page")) || 1);

  return (
    <>
      <PageHeader
        title="Subscription Management"
        description="Set plan prices, free trials and durations, and follow every hospital's subscription and payments."
      />
      <nav aria-label="Subscription sections" className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1">
        {TABS.map((item) => (
          <Link
            key={item.id}
            href={href({ tab: item.id })}
            aria-current={tab === item.id ? "page" : undefined}
            className={cn(
              "flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-brand",
              tab === item.id ? "bg-brand text-white" : "text-muted hover:bg-surface-high",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {tab === "plans" && <PlanManager plans={await withAdminToken(listPlans)} />}
      {tab === "hospitals" && <HospitalsTab status={status} search={search} page={page} />}
      {tab === "payments" && <PaymentsTab status={status} page={page} />}
    </>
  );
}

async function HospitalsTab({ status, search, page }: { status: string; search: string; page: number }) {
  const data = await withAdminToken((token) => listSubscriptions(token, { status, search, page }));
  const summary = data.summary;
  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Summary label="Trial active" value={summary.TRIAL_ACTIVE} />
        <Summary label="Active" value={summary.ACTIVE} tone="text-success" />
        <Summary label="Payment due / failed" value={summary.PAYMENT_PENDING + summary.PAYMENT_FAILED} tone="text-warning" />
        <Summary label="Expired / cancelled" value={summary.EXPIRED + summary.CANCELLED} />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <form className="flex flex-1 gap-2" action="/subscriptions">
            <input type="hidden" name="tab" value="hospitals" />
            {status && <input type="hidden" name="status" value={status} />}
            <input name="search" defaultValue={search} aria-label="Search hospitals" placeholder="Hospital name or email" className="h-10 flex-1 rounded-xl border border-line bg-surface px-3.5 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
            <button type="submit" className="h-10 rounded-[10px] border border-line px-4 text-sm font-semibold hover:bg-brand-soft">Search</button>
          </form>
          <Filters current={status} options={STATUS_FILTERS} build={(value) => href({ tab: "hospitals", status: value, search })} />
        </div>
        <SubscriptionsTable rows={data.results} />
      </Card>
      <Pagination page={data.page} totalPages={data.total_pages} totalCount={data.count} pageSize={data.page_size} hrefForPage={(next) => href({ tab: "hospitals", status, search, page: next })} />
    </>
  );
}

async function PaymentsTab({ status, page }: { status: string; page: number }) {
  const data = await withAdminToken((token) => listPayments(token, { status, page }));
  return (
    <>
      <Card className="overflow-hidden">
        <div className="border-b border-line p-4">
          <Filters current={status} options={PAYMENT_FILTERS} build={(value) => href({ tab: "payments", status: value })} />
        </div>
        <PaymentsTable rows={data.results} />
      </Card>
      <Pagination page={data.page} totalPages={data.total_pages} totalCount={data.count} pageSize={data.page_size} hrefForPage={(next) => href({ tab: "payments", status, page: next })} />
    </>
  );
}

function Filters({ current, options, build }: { current: string; options: readonly (readonly [string, string])[]; build: (value: string) => string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map(([value, label]) => (
        <Link
          key={value || "all"}
          href={build(value)}
          aria-current={current === value ? "true" : undefined}
          className={cn(
            "whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium",
            current === value ? "border-brand bg-brand-soft text-brand" : "border-line text-ink hover:bg-canvas",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

function Summary({ label, value, tone = "text-ink" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value.toLocaleString("en-IN")}</p>
    </div>
  );
}
