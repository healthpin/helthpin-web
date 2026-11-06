import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { requireSuperAdmin } from "@/lib/auth/session";
import { withAdminToken } from "@/lib/auth/adminRequest";
import { listRegistrations } from "@/features/hospital-registrations/api/registrationApi";
import { RegistrationTable } from "@/features/hospital-registrations/components/RegistrationTable";
export const metadata: Metadata = { title: "Hospital Registrations" };
export default async function HospitalRegistrationsPage({ searchParams }: PageProps<"/hospital-registrations">) {
  await requireSuperAdmin();
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "";
  const page = Math.max(1, Number(params.page) || 1);
  const data = await withAdminToken((token) => listRegistrations(token, { search, status, page }));
  const href = (next: number) => { const qs = new URLSearchParams(); if (search) qs.set("search", search); if (status) qs.set("status", status); if (next > 1) qs.set("page", String(next)); return `/hospital-registrations${qs.toString() ? `?${qs}` : ""}`; };
  return <><PageHeader title="Hospital Registrations" description="Review new hospitals and clinics before they enter the public directory." /><div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><Summary label="Total submissions" value={data.total_submissions} /><Summary label="Pending" value={data.summary.pending} tone="warning" /><Summary label="Approved" value={data.summary.approved} tone="success" /><Summary label="Rejected" value={data.summary.rejected} /></div><Card className="overflow-hidden"><RegistrationTable rows={data.results} search={search} status={status} /></Card><Pagination page={data.page} totalPages={data.total_pages} totalCount={data.count} pageSize={data.page_size} hrefForPage={href} /></>;
}
function Summary({ label, value, tone = "default" }: { label: string; value: number; tone?: string }) { return <div className="rounded-2xl border border-line bg-surface p-4 shadow-card"><p className="text-sm text-muted">{label}</p><p className={`mt-2 text-2xl font-bold ${tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-ink"}`}>{value.toLocaleString("en-IN")}</p></div>; }
