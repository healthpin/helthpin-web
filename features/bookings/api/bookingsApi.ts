import "server-only";

import { djangoFetch } from "@/lib/api/django";

import type { Booking, BookingPage, BookingQuery, BookingStatus, LiveQueue } from "../types/booking";

/** The signed-in hospital's bookings (/api/v1/hospital/bookings/). Server-only. */

export function listBookings(accessToken: string, query: BookingQuery): Promise<BookingPage> {
  const params = new URLSearchParams();
  if (query.scope) params.set("scope", query.scope);
  if (query.date) params.set("date", query.date);
  if (query.status) params.set("status", query.status);
  if (query.search) params.set("search", query.search);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return djangoFetch<BookingPage>(`/hospital/bookings/${qs ? `?${qs}` : ""}`, { accessToken });
}

export async function setBookingStatus(
  accessToken: string,
  id: number,
  status: BookingStatus,
): Promise<Booking> {
  const data = await djangoFetch<{ success: true; booking: Booking }>(`/hospital/bookings/${id}/`, {
    method: "PATCH",
    body: { status },
    accessToken,
  });
  return data.booking;
}

/** Live queue and waiting times; no date means today at the hospital. */
export function getLiveQueue(accessToken: string, date?: string): Promise<LiveQueue> {
  const qs = date ? `?${new URLSearchParams({ date })}` : "";
  return djangoFetch<LiveQueue>(`/hospital/bookings/queue/${qs}`, { accessToken });
}
