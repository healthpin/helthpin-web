import { isWebRole, type WebRole } from "./roles";

/**
 * Reads a JWT's expiry WITHOUT verifying the signature. Only used to decide
 * when to refresh a token or how long to keep its cookie; Django verifies
 * every token on every API call. Safe to use in proxy.ts (no Node-only APIs).
 */
function readClaims(token: string | undefined): Record<string, unknown> | null {
  if (!token) return null;
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json: unknown = JSON.parse(atob(base64));
    return json && typeof json === "object" ? (json as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string | undefined): number | null {
  const exp = readClaims(token)?.exp;
  return typeof exp === "number" ? exp : null;
}

/**
 * The account role Django put in the token ("super_admin" | "hospital").
 * For routing only; Django re-checks the role on every API call.
 */
export function getTokenRole(token: string | undefined): WebRole | null {
  const role = readClaims(token)?.role;
  return isWebRole(role) ? role : null;
}

/** True if the token is missing, unreadable, or expires within `skewSeconds`. */
export function isTokenExpired(token: string | undefined, skewSeconds = 30): boolean {
  const exp = getTokenExpiry(token);
  return exp === null || exp - skewSeconds <= Date.now() / 1000;
}
