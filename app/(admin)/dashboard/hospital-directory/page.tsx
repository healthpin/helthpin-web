import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DirectoryIcon, SearchIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/Pagination";
import { getDirectoryFilters, listDirectory } from "@/features/hospital-directory/api/directoryApi";
import { DirectoryFilters } from "@/features/hospital-directory/components/DirectoryFilters";
import { DirectoryTable } from "@/features/hospital-directory/components/DirectoryTable";
import type { DirectoryQuery } from "@/features/hospital-directory/types/directory";
import { withAdminToken } from "@/lib/auth/adminRequest";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Hospital Directory" };

const BASE = "/dashboard/hospital-directory";
const QUERY_KEYS = ["search", "location", "state", "district", "hospital_category"] as const;

export default async function HospitalDirectoryPage({
  searchParams,
}: PageProps<"/dashboard/hospital-directory">) {
  await requireSuperAdmin();

  const params = await searchParams;
  const query: DirectoryQuery = { page: Math.max(1, Number(params.page) || 1) };
  for (const key of QUERY_KEYS) {
    const value = params[key];
    if (typeof value === "string" && value.trim()) query[key] = value.trim();
  }

  // Real data from Django; errors go to app/(admin)/error.tsx.
  const [data, options] = await withAdminToken((token) =>
    Promise.all([listDirectory(token, query), getDirectoryFilters(token, query.state)]),
  );

  const queryString = (page?: number) => {
    const qs = new URLSearchParams();
    for (const key of QUERY_KEYS) if (query[key]) qs.set(key, String(query[key]));
    if (page && page > 1) qs.set("page", String(page));
    return qs.toString();
  };
  const current = queryString(query.page);
  const filtered = QUERY_KEYS.some((key) => query[key]);

  return (
    <>
      <PageHeader
        title="Hospital Directory"
        description="Reference data for hospitals across India, imported from the national directory. These are not login accounts."
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4">
          <DirectoryFilters options={options} />
          <p className="text-sm text-muted">
            {data.count.toLocaleString("en-IN")} {data.count === 1 ? "hospital" : "hospitals"}
            {filtered ? " found" : " in the directory"}
          </p>
        </div>

        {data.results.length > 0 ? (
          <DirectoryTable
            hospitals={data.results}
            // Keep the list's filters so "Back" returns to the same results.
            detailHref={(id) => `${BASE}/${id}${current ? `?back=${encodeURIComponent(current)}` : ""}`}
          />
        ) : filtered ? (
          <EmptyState
            icon={SearchIcon}
            title="No matching hospitals"
            description="Nothing matches these filters. Try a shorter name or clear a filter."
          />
        ) : (
          <EmptyState
            icon={DirectoryIcon}
            title="The directory is empty"
            description="Import it on the server with: python manage.py import_hospitals path/to/hospitals.csv"
          />
        )}
      </Card>

      <Pagination
        page={data.page}
        totalPages={data.total_pages}
        totalCount={data.count}
        pageSize={data.page_size}
        hrefForPage={(page) => {
          const qs = queryString(page);
          return qs ? `${BASE}?${qs}` : BASE;
        }}
      />
    </>
  );
}
