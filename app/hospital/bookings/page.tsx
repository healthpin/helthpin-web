import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarIcon, SearchIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/Pagination";
import { listBookings } from "@/features/bookings/api/bookingsApi";
import { BookingsTable } from "@/features/bookings/components/BookingsTable";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";
import { requireHospital } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Bookings" };

const BASE = "/hospital/bookings";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PAST_STATUSES = ["Completed", "Cancelled"] as const;

export default async function BookingsPage({ searchParams }: PageProps<"/hospital/bookings">) {
  await requireHospital();

  const params = await searchParams;
  // Upcoming = still to come. Past = finished (they move there on their own
  // once their time is over) plus cancelled ones.
  const scope = params.scope === "past" ? "past" : "upcoming";
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const date = typeof params.date === "string" && DATE_PATTERN.test(params.date) ? params.date : undefined;
  const status = scope === "past" ? PAST_STATUSES.find((s) => s === params.status) : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const data = await withHospitalToken((token) =>
    listBookings(token, { scope, date, status, search, page }),
  );

  const href = (next: { scope?: string; status?: string; page?: number }) => {
    const query = new URLSearchParams();
    const nextScope = next.scope ?? scope;
    if (nextScope !== "upcoming") query.set("scope", nextScope);
    if (date) query.set("date", date);
    if (search) query.set("search", search);
    const nextStatus = "status" in next ? next.status : status;
    if (nextStatus && nextScope === "past") query.set("status", nextStatus);
    if (next.page && next.page > 1) query.set("page", String(next.page));
    const qs = query.toString();
    return qs ? `${BASE}?${qs}` : BASE;
  };

  const filtered = Boolean(search || date || status);

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Appointments patients have booked with your doctors. New bookings are confirmed automatically."
        actions={
          <Link
            href="/hospital/queue"
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Live queue
          </Link>
        }
      />

      <div role="tablist" aria-label="Bookings" className="mb-4 flex gap-1 border-b border-line">
        {(["upcoming", "past"] as const).map((tab) => (
          <Link
            key={tab}
            role="tab"
            aria-selected={scope === tab}
            href={href({ scope: tab, status: undefined, page: 1 })}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold",
              scope === tab
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {tab === "upcoming" ? "Upcoming" : "Past"}
          </Link>
        ))}
      </div>

      <Card className="mb-4 flex flex-col gap-3 p-4">
        <form action={BASE} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {scope === "past" && <input type="hidden" name="scope" value="past" />}
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="date"
            name="date"
            defaultValue={date ?? ""}
            aria-label="Appointment date"
            className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search patient, phone or doctor"
            aria-label="Search bookings"
            className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Apply
          </button>
        </form>
        {scope === "past" && (
          <nav aria-label="Filter by outcome" className="flex flex-wrap items-center gap-1">
            {[undefined, ...PAST_STATUSES].map((option) => (
              <Link
                key={option ?? "all"}
                href={href({ status: option })}
                aria-current={status === option ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium",
                  status === option ? "bg-brand-soft text-brand" : "text-muted hover:bg-canvas",
                )}
              >
                {option ?? "All"}
              </Link>
            ))}
          </nav>
        )}
      </Card>

      <Card className="overflow-hidden">
        {data.results.length > 0 ? (
          <>
            <p className="border-b border-line px-4 py-3 text-sm text-muted">
              {data.count} {scope === "past" ? "past" : "upcoming"}{" "}
              {data.count === 1 ? "booking" : "bookings"}
              {filtered ? " found" : ""}
            </p>
            <BookingsTable bookings={data.results} />
          </>
        ) : filtered ? (
          <EmptyState
            icon={SearchIcon}
            title="No matching bookings"
            description="Try another date or search."
          />
        ) : scope === "upcoming" ? (
          <EmptyState
            icon={CalendarIcon}
            title="No upcoming bookings"
            description="New appointments appear here, already confirmed, as patients book."
          />
        ) : (
          <EmptyState
            icon={CalendarIcon}
            title="No past bookings yet"
            description="Appointments move here automatically once their time is over."
          />
        )}
      </Card>

      <Pagination
        page={data.page}
        totalPages={data.total_pages}
        totalCount={data.count}
        pageSize={data.page_size}
        hrefForPage={(target) => href({ page: target })}
      />
    </>
  );
}
