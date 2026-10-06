import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { StatGrid } from "@/features/dashboard/components/StatGrid";
import { getDashboardStats } from "@/features/dashboard/data/getDashboardStats";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  // Checked here too, not only in the layout: pages must never rely on a
  // parent alone for authorization.
  const admin = await requireSuperAdmin();
  const { stats, isMock } = await getDashboardStats();

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Welcome back, ${admin.email}.`}
        actions={isMock ? <Badge tone="warning">Demo data</Badge> : undefined}
      />

      <StatGrid>
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </StatGrid>

      <Card className="mt-6 p-6">
        <h3 className="text-base font-semibold text-ink">Admin modules</h3>
        <p className="mt-1 text-sm text-muted">
          Management for users, doctors, appointments and prescriptions will appear here
          as each module is built. The figures above are placeholders until their APIs
          exist.
        </p>
      </Card>
    </>
  );
}
