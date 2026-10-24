/** A prescription this hospital uploaded for an appointment (no storage details). */
export interface HospitalPrescription {
  id: string;
  booking_id: number;
  patient_name: string;
  name: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
}

/** Uploaded prescriptions keyed by booking id, for the bookings on screen. */
export type PrescriptionsByBooking = Record<number, HospitalPrescription>;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"] as const;
