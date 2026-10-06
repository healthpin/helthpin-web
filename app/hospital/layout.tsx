import type { ReactNode } from "react";

import { AccessDenied } from "@/components/layout/AccessDenied";
import { AppShell } from "@/components/layout/AppShell";
import { getHospitalSession } from "@/lib/auth/session";

/**
 * Hospital area (/hospital/...). Django decides who gets in: this layout
 * asks GET /hospital/auth/me/, which only hospital accounts pass.
 */
export default async function HospitalLayout({ children }: { children: ReactNode }) {
  const session = await getHospitalSession();
  if (session.status === "forbidden") return <AccessDenied homeHref="/dashboard" />;

  const hospital = session.account;
  return (
    <AppShell area="hospital" account={{ name: hospital.name, detail: hospital.email }}>
      {children}
    </AppShell>
  );
}
