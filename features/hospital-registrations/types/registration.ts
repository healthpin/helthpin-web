export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface HospitalRegistration {
  id: number; hospital_name: string; category: "HOSPITAL" | "CLINIC"; whatsapp_number: string;
  contact_number: string; email: string; address: string; latitude: string; longitude: string;
  status: RegistrationStatus; rejection_reason: string; reviewed_by_email?: string;
  reviewed_at?: string | null; created_at: string; updated_at: string;
}
export interface RegistrationPage { success: true; count: number; page: number; page_size: number; total_pages: number; results: HospitalRegistration[]; summary: { pending: number; approved: number; rejected: number }; total_submissions: number; }
