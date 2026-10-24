import "server-only";

import { DjangoApiError, djangoFetch } from "@/lib/api/django";

import type { HospitalPrescription, PrescriptionsByBooking } from "../types/prescription";

/** The hospital's uploads for the given bookings (/api/v1/hospital/prescriptions/). */
export async function listPrescriptionsForBookings(
  accessToken: string,
  bookingIds: number[],
): Promise<PrescriptionsByBooking> {
  if (bookingIds.length === 0) return {};
  const params = new URLSearchParams({ booking_ids: bookingIds.join(","), page_size: "100" });
  try {
    const data = await djangoFetch<{ results: HospitalPrescription[] }>(
      `/hospital/prescriptions/?${params}`,
      { accessToken },
    );
    return Object.fromEntries(data.results.map((item) => [item.booking_id, item]));
  } catch (error) {
    // The bookings list matters more than the upload badges: if this extra
    // lookup fails, show the bookings without them (the server still refuses
    // a second prescription). An ended session must still sign the user out.
    if (error instanceof DjangoApiError && !error.isUnauthorized) return {};
    throw error;
  }
}

export function removePrescription(accessToken: string, id: string): Promise<unknown> {
  return djangoFetch(`/hospital/prescriptions/${encodeURIComponent(id)}/`, { method: "DELETE", accessToken });
}
