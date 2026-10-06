import type { ReactNode } from "react";

import { AccessDenied } from "@/components/layout/AccessDenied";
import { AppShell } from "@/components/layout/AppShell";
import { getAdminSession } from "@/lib/auth/session";

/**
 * Every page in this group needs a Super Admin. Django decides: this layout
 * asks GET /admin/auth/me/ with the session's token (see lib/auth/session.ts).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (session.status === "forbidden") return <AccessDenied homeHref="/hospital/dashboard" />;

  return (
    <AppShell area="admin" account={{ name: session.account.email, detail: "Super Admin" }}>
      {children}
    </AppShell>
  );
}
