import type { LoginFieldErrors } from "./types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same checks on the server (authoritative) and in the browser (instant feedback). */
export function validateLoginInput(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function hasErrors(errors: LoginFieldErrors): boolean {
  return Boolean(errors.email || errors.password);
}

/**
 * Where to go after login. Only same-site paths are allowed, so a crafted
 * ?next=https://evil.example link can't bounce the admin to another site.
 */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  if (value === "/login" || value.startsWith("/api/")) return null;
  return value;
}
