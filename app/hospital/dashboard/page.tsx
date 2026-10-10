import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { HospitalOverview } from "@/features/hospital-portal/components/HospitalOverview";
import { getHospitalDashboard } from "@/features/hospital-portal/api/hospitalPortalApi";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";
import { requireHospital } from "@/lib/auth/session";
export const metadata: Metadata = { title: "Hospital overview" };
export default async function HospitalDashboardPage() {
  const hospital = await requireHospital();
  const data = await withHospitalToken(getHospitalDashboard);
  return <><PageHeader title="Hospital overview" description={`Welcome back to ${hospital.name}. Let's keep care moving.`} actions={<Link href="/hospital/doctors" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">Manage doctors</Link>} /><HospitalOverview initial={data} /></>;
}
