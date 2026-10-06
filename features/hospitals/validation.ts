import type { HospitalFieldErrors, HospitalInput } from "./types/hospital";

/**
 * Mirrors the Django rules (apps/hospitals/serializers.py + passwords.py) so
 * most mistakes are caught before a round trip. Django stays authoritative:
 * it also rejects common passwords, duplicates, etc.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MAX_LENGTH = 200;

export function normalizeHospitalInput(raw: {
  name: string;
  email: string;
  password?: string;
}): HospitalInput {
  return {
    name: raw.name.replace(/\s+/g, " ").trim(),
    email: raw.email.trim().toLowerCase(),
    password: raw.password ?? "",
  };
}

export function validateHospitalInput(
  input: HospitalInput,
  { requirePassword }: { requirePassword: boolean },
): HospitalFieldErrors {
  const errors: HospitalFieldErrors = {};

  if (input.name.length < 2) errors.name = "Enter the hospital name.";
  else if (input.name.length > NAME_MAX_LENGTH)
    errors.name = `Name can be at most ${NAME_MAX_LENGTH} characters.`;

  if (!input.email) errors.email = "Enter the hospital's email address.";
  else if (!EMAIL_PATTERN.test(input.email)) errors.email = "Enter a valid email address.";

  if (requirePassword) {
    const problem = passwordProblem(input.password);
    if (problem) errors.password = problem;
  }
  return errors;
}

/** Basic password rules (Django also rejects common passwords etc.). */
export function passwordProblem(password: string): string | undefined {
  if (!password) return "Enter a password.";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    return "Password must contain at least one letter and one number.";
  return undefined;
}

/** New password + confirmation. */
export function validatePasswordChange(
  password: string,
  confirm: string,
): { password?: string; confirm?: string } {
  const errors: { password?: string; confirm?: string } = {};
  const problem = passwordProblem(password);
  if (problem) errors.password = problem;
  if (!confirm) errors.confirm = "Enter the new password again.";
  else if (confirm !== password) errors.confirm = "The passwords don't match.";
  return errors;
}

export function hasFieldErrors(errors: HospitalFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
