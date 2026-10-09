export const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** A booking as the hospital API returns it. */
export interface Booking {
  booking_id: number;
  code: string;
  hospital_id: number;
  hospital_name: string;
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  patient_name: string;
  patient_phone: string;
  notes: string;
  /** YYYY-MM-DD */
  booking_date: string;
  token_number: number;
  /** HH:MM, hospital local time */
  slot_start: string;
  slot_end: string;
  status: BookingStatus;
  can_cancel: boolean;
  created_at: string;
}

export interface BookingPage {
  success: true;
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: Booking[];
}

export interface BookingQuery {
  /** upcoming = still to come; past = finished (shown automatically) or cancelled. */
  scope?: "upcoming" | "past";
  date?: string;
  status?: BookingStatus;
  search?: string;
  page?: number;
}

/** One waiting patient in a doctor's live queue. */
export interface QueueEntry {
  booking_id: number;
  token_number: number;
  patient_name: string;
  slot_start: string;
  status: BookingStatus;
  tokens_ahead: number;
  wait_minutes: number;
}

export interface DoctorQueue {
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  total_tokens: number;
  completed: number;
  waiting: number;
  now_serving: number | null;
  queue_clears_in_minutes: number;
  queue: QueueEntry[];
}

export interface LiveQueue {
  success: true;
  date: string;
  token_minutes: number;
  doctors: DoctorQueue[];
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** "14:05" -> "2:05 PM". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** 0 -> "No wait", 45 -> "45 min", 75 -> "1 h 15 min". */
export function formatWait(minutes: number): string {
  if (minutes <= 0) return "No wait";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}

/** "2026-10-12" -> "Mon, 12 Oct 2026" (as written, no time zone shifts). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
