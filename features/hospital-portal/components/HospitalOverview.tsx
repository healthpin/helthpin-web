"use client";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CalendarIcon, StethoscopeIcon, UsersIcon, ClockIcon } from "@/components/ui/icons";
import { BookingsTable } from "@/features/bookings/components/BookingsTable";
import { formatDate } from "@/features/bookings/types/booking";
import { fetchDashboardAction } from "../actions/portalActions";
import type { HospitalDashboard } from "../types/hospitalPortal";
import { useLiveData } from "./useLiveData";
import { LiveIndicator } from "./LiveIndicator";

export function HospitalOverview({ initial }: { initial: HospitalDashboard }) {
  const live = useLiveData(initial, fetchDashboardAction);
  const { data } = live;
  const { stats } = data;
  const peak = Math.max(1, ...data.week.map((day) => day.count));
  const cards = [
    { label: "Total bookings today", value: stats.bookings_today, hint: "All appointments, including cancellations", icon: CalendarIcon },
    { label: "Active doctors", value: stats.active_doctors, hint: "Available in your hospital", icon: StethoscopeIcon },
    { label: "Total patients", value: stats.total_patients, hint: "Unique patient accounts with non-cancelled bookings", icon: UsersIcon },
    { label: "Average waiting time", value: `${stats.average_wait_minutes} min`, hint: "Estimated across today's active queues", icon: ClockIcon },
  ];
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">{formatDate(data.date)} | Your hospital at a glance</p><LiveIndicator {...live} /></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, hint, icon: Icon }) => <Card key={label} className="p-5">
      <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-muted">{label}</p><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon /></span></div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">{value}</p><p className="mt-2 text-xs leading-5 text-subtle">{hint}</p>
    </Card>)}</div>
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Booking activity</h2><p className="mt-1 text-sm text-muted">Appointments over the last 7 days</p></div><span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">{data.week.reduce((total, day) => total + day.count, 0)} bookings</span></div>
        <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-5" aria-label="Daily booking counts">{data.week.map((day) => <div key={day.date} className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-muted">{day.count}</span>
          <div className="flex h-32 w-full max-w-12 items-end rounded-lg bg-brand-soft/60"><div className="w-full rounded-lg bg-brand-strong transition-all" style={{ height: day.count ? `${Math.max(4, day.count / peak * 100)}%` : "0%" }} /></div>
          <span className="text-xs text-muted">{new Date(`${day.date}T12:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" })}</span>
          <span className="sr-only">{day.date}: {day.count} bookings</span>
        </div>)}</div>
      </Card>
      <Card className="p-6"><h2 className="font-semibold">Today&apos;s patient flow</h2><p className="mt-1 text-sm text-muted">Every token is a 15-minute slot</p>
        <dl className="mt-5 space-y-4">{[["In the queue", stats.waiting], ["Completed", stats.completed], ["Cancelled", stats.cancelled]].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3"><dt className="text-sm text-muted">{label}</dt><dd className="text-xl font-semibold text-brand">{value}</dd></div>)}</dl>
        <Link href="/hospital/queue" className="mt-5 block text-sm font-semibold text-brand hover:underline">Open live queue &rarr;</Link>
      </Card>
    </div>
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5"><div><h2 className="font-semibold">Recent appointments</h2><p className="mt-1 text-sm text-muted">The latest bookings made for today</p></div><Link href="/hospital/bookings" className="text-sm font-semibold text-brand hover:underline">View all bookings &rarr;</Link></div>
      {data.recent.length ? <BookingsTable bookings={data.recent} queue={data.queue} onChanged={live.refresh} /> : <div className="p-10 text-center"><CalendarIcon className="mx-auto mb-3 text-brand" /><p className="font-medium">No appointments today</p><p className="mt-1 text-sm text-muted">Patient bookings will appear here as they arrive.</p></div>}
    </Card>
  </div>;
}
