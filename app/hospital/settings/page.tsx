import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { HospitalSettings } from "@/features/hospital-portal/components/HospitalSettings";
import { getHospitalProfile } from "@/features/hospital-portal/api/hospitalPortalApi";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";
import { requireHospital } from "@/lib/auth/session";
export const metadata: Metadata = { title: "Hospital settings" };
export default async function SettingsPage() {
  await requireHospital();
  const profile = await withHospitalToken(getHospitalProfile);
  return <><PageHeader title="Hospital settings" description="Manage your hospital profile and account credentials." /><HospitalSettings profile={profile} /></>;
}
