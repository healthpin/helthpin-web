/** A hospital as the Super Admin API returns it. Never contains a password. */
export interface Hospital {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** GET /admin/hospitals/ (paginated). */
export interface HospitalPage {
  success: true;
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: Hospital[];
}

export interface HospitalListQuery {
  search?: string;
  page?: number;
  status?: "active" | "inactive";
}

export interface HospitalInput {
  name: string;
  email: string;
  password: string;
}

export type HospitalField = keyof HospitalInput;
export type HospitalFieldErrors = Partial<Record<HospitalField, string>>;

/** Result of the create / edit Server Actions, shown by the form. */
export interface HospitalFormState {
  /** Changes on every success so the form can react once (close, toast). */
  successAt?: number;
  successMessage?: string;
  message?: string;
  fieldErrors?: HospitalFieldErrors;
  /** Echoed back after a failure so the inputs keep their values (never the password). */
  values?: { name: string; email: string };
}

/** Result of the change-password Server Action. */
export interface PasswordFormState {
  successAt?: number;
  successMessage?: string;
  message?: string;
  fieldErrors?: { password?: string; confirm?: string };
}

export interface ActionResult {
  ok: boolean;
  message: string;
}
