/**
 * Which part of the app each account type uses. Shared by proxy.ts (no
 * Node-only imports) and server code.
 *
 *   super_admin -> /dashboard, ... (everything outside /hospital)
 *   hospital    -> /hospital/...
 *
 * This only routes people to the right place. Django's permissions
 * (IsSuperAdmin, IsHospital) decide what each account can actually do.
 */
export type WebRole = "super_admin" | "hospital";

export const ROLE_HOME: Record<WebRole, string> = {
  super_admin: "/dashboard",
  hospital: "/hospital/dashboard",
};

export function isWebRole(value: unknown): value is WebRole {
  return value === "super_admin" || value === "hospital";
}

function isHospitalArea(pathname: string): boolean {
  return pathname === "/hospital" || pathname.startsWith("/hospital/");
}

/** Whether `role` belongs on `pathname`. */
export function isPathAllowedFor(role: WebRole, pathname: string): boolean {
  return role === "hospital" ? isHospitalArea(pathname) : !isHospitalArea(pathname);
}
