"use server";

import { revalidatePath } from "next/cache";

import { DjangoApiError } from "@/lib/api/django";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";

import { getLiveQueue, setBookingStatus } from "../api/bookingsApi";
import type { ActionResult, LiveQueue } from "../types/booking";

/** Cancel a booking: the only change hospital staff can make (they are confirmed automatically). */
export async function cancelBookingAction(bookingId: number): Promise<ActionResult> {
  try {
    const booking = await withHospitalToken((token) => setBookingStatus(token, bookingId, "Cancelled"));
    revalidatePath("/hospital/bookings");
    revalidatePath("/hospital/queue");
    return { ok: true, message: `${booking.patient_name}'s booking was cancelled.` };
  } catch (error) {
    if (error instanceof DjangoApiError) return { ok: false, message: error.message };
    throw error;
  }
}

/** For the live queue's polling: the latest queue, or null if it can't be loaded right now. */
export async function fetchLiveQueueAction(date?: string): Promise<LiveQueue | null> {
  try {
    return await withHospitalToken((token) => getLiveQueue(token, date));
  } catch (error) {
    if (error instanceof DjangoApiError) return null;
    throw error;
  }
}
