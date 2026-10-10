/** The signed-in hospital (GET /hospital/auth/me/). */
export interface CurrentHospital {
  id: number;
  name: string;
  email: string;
}

export interface HospitalProfile {
  name: string; category: "Hospital" | "Clinic"; email: string;
  address: string; telephone: string; website: string;
  state: string; district: string; pincode: string;
}

export interface HospitalDashboard {
  date: string;
  stats: { bookings_today: number; active_doctors: number; total_patients: number;
    average_wait_minutes: number; waiting: number; completed: number; cancelled: number };
  week: { date: string; count: number }[];
  recent: import("@/features/bookings/types/booking").Booking[];
  queue: import("@/features/bookings/types/booking").LiveQueue;
}
export interface SettingsState {
  message?: string; success?: boolean; fieldErrors?: Record<string, string>;
}
