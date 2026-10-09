/** A partner as the Super Admin API returns it. Never contains a password. */
export interface Partner {
  id: number;
  email: string;
  is_active: boolean;
  category: string;
  hospital_directory_id: number;
}

export type PartnerField = "email" | "password" | "category";
export type PartnerFieldErrors = Partial<Record<PartnerField, string>>;

/** Result of the make / edit partner Server Actions, shown by the form. */
export interface PartnerFormState {
  /** Changes on every success so the form can react once (close, toast). */
  successAt?: number;
  successMessage?: string;
  message?: string;
  fieldErrors?: PartnerFieldErrors;
  /** Echoed back after a failure so the inputs keep their values (never the password). */
  values?: { email: string; category: string };
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
