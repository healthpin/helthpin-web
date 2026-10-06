import type { WebRole } from "@/lib/auth/roles";

/** The signed-in Super Admin, as returned by Django. Never contains a password. */
export interface AdminUser {
  id: number;
  email: string;
  is_super_admin: boolean;
}

/** The account in the shared login response. */
export interface WebUser {
  id: number;
  email: string;
  role: WebRole;
  /** Only for hospital accounts. */
  hospital?: { id: number; name: string };
}

/** POST /auth/login/ (Super Admins and hospitals) */
export interface LoginResponse {
  success: true;
  message: string;
  access: string;
  refresh: string;
  user: WebUser;
}

/** GET /admin/auth/me/ */
export interface CurrentAdminResponse {
  success: true;
  admin: AdminUser;
}

export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

/** What the login Server Action returns to the form. */
export interface LoginFormState {
  message?: string;
  fieldErrors?: LoginFieldErrors;
  /** Echoed back so the email survives a failed attempt (never the password). */
  email?: string;
}
