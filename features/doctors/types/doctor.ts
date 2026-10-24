export const GENDERS = ["Male", "Female", "Other"] as const;
export type Gender = (typeof GENDERS)[number];

/** A doctor as the hospital API returns it. */
export interface Doctor {
  id: number;
  full_name: string;
  photo_url: string;
  gender: Gender;
  qualification: string;
  specialization: string;
  experience_years: number;
  department: string;
  designation: string;
  /** Availability: active doctors can be shown to patients. */
  is_active: boolean;
  /** Token schedule: 0 = Monday .. 6 = Sunday. Empty/null = not bookable. */
  working_days: number[];
  start_time: string | null;
  end_time: string | null;
  token_count: number | null;
  /** How long each appointment lasts, in minutes (15 unless changed). */
  slot_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface DoctorPage {
  success: true;
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: Doctor[];
}

export interface DoctorListQuery {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
}

/** The fields the Add / Edit form sends. */
export interface DoctorInput {
  full_name: string;
  photo_url: string;
  gender: string;
  qualification: string;
  specialization: string;
  experience_years: number | null;
  department: string;
  designation: string;
  is_active: boolean;
  working_days: number[];
  /** "HH:MM", or "" for none. */
  start_time: string;
  end_time: string;
  token_count: number | null;
  slot_minutes: number;
}

/** What is sent to Django: cleared times are null. */
export type DoctorPayload = Omit<DoctorInput, "start_time" | "end_time"> & {
  start_time: string | null;
  end_time: string | null;
};

export type DoctorField = keyof DoctorInput;
export type DoctorFieldErrors = Partial<Record<DoctorField, string>>;

export interface DoctorFormState {
  /** Changes on every success so the form can react once (close, toast). */
  successAt?: number;
  successMessage?: string;
  message?: string;
  fieldErrors?: DoctorFieldErrors;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Doctors start with 15-minute appointments. */
export const DEFAULT_SLOT_MINUTES = 15;
/** The lengths a hospital can choose; Django enforces the same list. */
export const SLOT_MINUTE_OPTIONS = [10, 15, 20, 30, 45, 60] as const;
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const toMinutes = (time: string) => {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m);
};

/** How many whole tokens of [minutes] fit between two "HH:MM" times (0 if invalid). */
export function tokensThatFit(start: string, end: string, minutes: number = DEFAULT_SLOT_MINUTES): number {
  if (!start || !end || !(minutes > 0)) return 0;
  return Math.max(0, Math.floor((toMinutes(end) - toMinutes(start)) / minutes));
}

/** "09:00:00" -> "09:00". */
export const hhmm = (time: string | null) => (time ? time.slice(0, 5) : "");

/** "Mon, Wed, Fri · 09:00–11:00 · 8 tokens", or null without a schedule. */
export function scheduleSummary(
  doctor: Pick<Doctor, "working_days" | "start_time" | "end_time" | "token_count" | "slot_minutes">,
) {
  if (!doctor.working_days.length || !doctor.start_time || !doctor.end_time || !doctor.token_count)
    return null;
  const days = doctor.working_days.map((d) => WEEKDAYS[d]).join(", ");
  return `${days} · ${hhmm(doctor.start_time)}–${hhmm(doctor.end_time)} · ${doctor.token_count} tokens of ${doctor.slot_minutes} min`;
}
