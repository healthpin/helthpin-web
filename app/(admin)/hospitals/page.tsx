import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { BuildingIcon, SearchIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/Pagination";
import { listHospitals } from "@/features/hospitals/api/hospitalsApi";
import { AddHospitalButton } from "@/features/hospitals/components/AddHospitalButton";
import { HospitalSearch } from "@/features/hospitals/components/HospitalSearch";
import { HospitalsTable } from "@/features/hospitals/components/HospitalsTable";
import { withAdminToken } from "@/lib/auth/adminRequest";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Hospitals" };

export default async function HospitalsPage({ searchParams }: PageProps<"/hospitals">) {
  await requireSuperAdmin();

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);

  // Real data from Django; errors go to app/(admin)/error.tsx.
  const data = await withAdminToken((token) => listHospitals(token, { search, page }));

  const hrefForPage = (target: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `/hospitals?${qs}` : "/hospitals";
  };

  return (
    <>
      <PageHeader
        title="Hospitals"
        description="Create hospital accounts and manage their access."
        actions={<AddHospitalButton />}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <HospitalSearch />
          <p className="text-sm text-muted">
            {data.count} {data.count === 1 ? "hospital" : "hospitals"}
            {search ? " found" : ""}
          </p>
        </div>

        {data.results.length > 0 ? (
          <HospitalsTable hospitals={data.results} />
        ) : search ? (
          <EmptyState
            icon={SearchIcon}
            title="No matching hospitals"
            description={`Nothing matches "${search}". Try another name or email.`}
          />
        ) : (
          <EmptyState
            icon={BuildingIcon}
            title="No hospitals yet"
            description="Add the first hospital. It can then sign in with the email and password you set."
            action={<AddHospitalButton />}
          />
        )}
      </Card>

      <Pagination
        page={data.page}
        totalPages={data.total_pages}
        totalCount={data.count}
        pageSize={data.page_size}
        hrefForPage={hrefForPage}
      />
    </>
  );
}
