import type { PartnerFieldErrors } from "./types/partner";

/**
 * Mirrors the Django rules (apps/hospitals/serializers.py + passwords.py) so
 * most mistakes are caught before a round trip. Django stays authoritative:
 * it also rejects common passwords, duplicates, etc.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MAX_LENGTH = 128;
export const PARTNER_CATEGORIES = ["Hospital", "Clinic"] as const;

export function normalizePartnerInput(raw: { email: string; password?: string; category?: string }) {
  return {
    email: raw.email.trim().toLowerCase(),
    password: raw.password ?? "",
    category: (raw.category ?? "").trim(),
  };
}

export function validatePartnerInput(
  input: ReturnType<typeof normalizePartnerInput>,
  { requirePassword }: { requirePassword: boolean },
): PartnerFieldErrors {
  const errors: PartnerFieldErrors = {};

  if (!input.email) errors.email = "Enter the partner's email address.";
  else if (!EMAIL_PATTERN.test(input.email)) errors.email = "Enter a valid email address.";

  if (requirePassword) {
    const problem = passwordProblem(input.password);
    if (problem) errors.password = problem;
  }
  if (!(PARTNER_CATEGORIES as readonly string[]).includes(input.category))
    errors.category = "Choose Hospital or Clinic.";
  return errors;
}

/** Any non-empty password is fine: no length or character-mix rules. */
export function passwordProblem(password: string): string | undefined {
  if (!password) return "Enter a password.";
  if (password.length > PASSWORD_MAX_LENGTH)
    return `Password can be at most ${PASSWORD_MAX_LENGTH} characters.`;
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

export function hasFieldErrors(errors: PartnerFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
