"use client";
import { useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { BookingsTable } from "./BookingsTable";
import { fetchBookingsAction } from "../actions/bookingActions";
import type { BookingPage, BookingQuery, LiveQueue } from "../types/booking";
import { useLiveData } from "@/features/hospital-portal/components/useLiveData";
import { LiveIndicator } from "@/features/hospital-portal/components/LiveIndicator";

export function LiveBookings({ initial, query }: { initial: { bookings: BookingPage; queue: LiveQueue }; query: BookingQuery }) {
  const load = useCallback(() => fetchBookingsAction(query), [query]);
  const live = useLiveData(initial, load);
  const { bookings, queue } = live.data;
  function href(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...query, page })) if (value !== undefined) params.set(key, String(value));
    return `/hospital/bookings?${params}`;
  }
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">{bookings.count} bookings | 15-minute appointments</p><LiveIndicator {...live} /></div>
    <Card className="overflow-hidden">{bookings.results.length ? <BookingsTable bookings={bookings.results} queue={queue} onChanged={live.refresh} /> : <div className="p-10 text-center"><h2 className="font-semibold">No bookings found</h2><p className="mt-2 text-sm text-muted">Try another filter. New patient bookings appear automatically.</p></div>}</Card>
    {bookings.total_pages > 1 && <nav aria-label="Booking pages" className="flex items-center justify-between gap-3 text-sm"><span className="text-muted">Page {bookings.page} of {bookings.total_pages}</span><div className="flex gap-4">{bookings.page > 1 && <Link className="font-semibold text-brand" href={href(bookings.page - 1)}>Previous</Link>}{bookings.page < bookings.total_pages && <Link className="font-semibold text-brand" href={href(bookings.page + 1)}>Next</Link>}</div></nav>}
  </div>;
}
