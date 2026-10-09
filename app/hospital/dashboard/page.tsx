import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { BuildingIcon } from "@/components/ui/icons";
import { requireHospital } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Hospital Dashboard" };

/** Placeholder until the Hospital Portal features are built. */
export default async function HospitalDashboardPage() {
  const hospital = await requireHospital();

  return (
    <>
      <PageHeader title={`Welcome, ${hospital.name}`} description="Hospital dashboard" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <BuildingIcon />
            </span>
            <div>
              <h3 className="text-base font-semibold text-ink">Your hospital account is ready</h3>
              <p className="mt-1 text-sm text-muted">
                Hospital tools such as OPD queues and appointments will appear here
                as they are added to Health Pin.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-subtle">Account</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Hospital</dt>
              <dd className="font-medium text-ink">{hospital.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Sign-in email</dt>
              <dd className="break-all font-medium text-ink">{hospital.email}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  );
}
