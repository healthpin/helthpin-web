import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchIcon, StethoscopeIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/Pagination";
import { listDoctors } from "@/features/doctors/api/doctorsApi";
import { DoctorCard } from "@/features/doctors/components/DoctorCard";
import { DoctorDialog } from "@/features/doctors/components/DoctorDialog";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";
import { requireHospital } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Doctors" };

const BASE = "/hospital/doctors";
const STATUSES = [
  { label: "All", value: undefined },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export default async function DoctorsPage({ searchParams }: PageProps<"/hospital/doctors">) {
  await requireHospital();

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const status = params.status === "active" || params.status === "inactive" ? params.status : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const data = await withHospitalToken((token) => listDoctors(token, { search, status, page }));

  const href = (next: { status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (next.status) query.set("status", next.status);
    if (next.page && next.page > 1) query.set("page", String(next.page));
    const qs = query.toString();
    return qs ? `${BASE}?${qs}` : BASE;
  };

  const filtered = Boolean(search || status);

  return (
    <>
      <PageHeader
        title="Doctors"
        description="The doctors who work at your hospital."
        actions={<DoctorDialog />}
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <form action={BASE} className="flex flex-1 gap-2 sm:max-w-md">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search name, specialization or department"
            aria-label="Search doctors"
            className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Search
          </button>
        </form>
        <nav aria-label="Filter by status" className="flex items-center gap-1">
          {STATUSES.map((option) => (
            <Link
              key={option.label}
              href={href({ status: option.value })}
              aria-current={status === option.value ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium",
                status === option.value ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas",
              )}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </Card>

      {data.results.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-muted">
            {data.count} {data.count === 1 ? "doctor" : "doctors"}
            {filtered ? " found" : ""}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.results.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          {filtered ? (
            <EmptyState
              icon={SearchIcon}
              title="No matching doctors"
              description="Try a different search or status filter."
            />
          ) : (
            <EmptyState
              icon={StethoscopeIcon}
              title="No doctors yet"
              description="Add your first doctor to list them under your hospital."
              action={<DoctorDialog />}
            />
          )}
        </Card>
      )}

      <Pagination
        page={data.page}
        totalPages={data.total_pages}
        totalCount={data.count}
        pageSize={data.page_size}
        hrefForPage={(target) => href({ status, page: target })}
      />
    </>
  );
}
