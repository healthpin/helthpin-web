import type { ReactNode } from "react";

import { AccessDenied } from "@/components/layout/AccessDenied";
import { AppShell } from "@/components/layout/AppShell";
import { PaymentReminder } from "@/features/subscriptions/components/PaymentReminder";
import { getHospitalSubscriptionState } from "@/features/subscriptions/lib/access";
import { getHospitalSession } from "@/lib/auth/session";

/**
 * Hospital area (/hospital/...). Django decides who gets in: this layout
 * asks GET /hospital/auth/me/, which only hospital accounts pass.
 *
 * Subscription access is enforced per page (requireSubscribedHospital) and by
 * Django on every restricted API; the layout only reflects it (navbar status,
 * locked sidebar items). Layouts are not re-rendered on every client
 * navigation, so they must not be the gate.
 */
export default async function HospitalLayout({ children }: { children: ReactNode }) {
  const session = await getHospitalSession();
  if (session.status === "forbidden") return <AccessDenied homeHref="/dashboard" />;

  const hospital = session.account;
  // A failure only hides the status chip; it never takes the workspace down.
  const state = await getHospitalSubscriptionState();
  return (
    <AppShell
      area="hospital"
      account={{ name: hospital.name, detail: hospital.email }}
      locked={state ? !state.subscription.has_access : false}
      headerAside={state ? <PaymentReminder subscription={state.subscription} hospitalId={hospital.id} /> : undefined}
    >
      {children}
    </AppShell>
  );
}
