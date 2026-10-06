import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { fetchCurrentAdmin } from "@/features/authentication/api/authApi";
import type { AdminUser } from "@/features/authentication/types/auth";
import { fetchCurrentHospital } from "@/features/hospital-portal/api/hospitalPortalApi";
import type { CurrentHospital } from "@/features/hospital-portal/types/hospitalPortal";
import { DjangoApiError } from "@/lib/api/django";

import { ACCESS_COOKIE } from "./cookies";

/** Where to send someone whose session can't be used any more. */
export const SESSION_EXPIRED_URL = "/api/auth/session-expired";

type Session<T> = { status: "authenticated"; account: T; accessToken: string } | { status: "forbidden" };

export type AdminSession = Session<AdminUser>;
export type HospitalSession = Session<CurrentHospital>;

/**
 * The real access check (the "data access layer"): asks Django who the
 * token belongs to. Django's IsSuperAdmin / IsHospital permission decides;
 * this app only reacts:
 *
 *   no / invalid / expired token -> clear the cookies, go to /login
 *   valid token, wrong kind of account (403) -> "forbidden"
 */
async function verify<T>(fetchAccount: (token: string) => Promise<T>): Promise<Session<T>> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect(SESSION_EXPIRED_URL);

  try {
    const account = await fetchAccount(accessToken);
    return { status: "authenticated", account, accessToken };
  } catch (error) {
    if (error instanceof DjangoApiError && error.isForbidden) return { status: "forbidden" };
    if (error instanceof DjangoApiError && error.isUnauthorized) redirect(SESSION_EXPIRED_URL);
    throw error; // Network/server problems: shown by the error boundary.
  }
}

/** Super Admin session, memoised per request (layouts and pages share it). */
export const getAdminSession = cache(() => verify(fetchCurrentAdmin));

/** Hospital session, memoised per request. */
export const getHospitalSession = cache(() => verify(fetchCurrentHospital));

/** For Super Admin Server Components. */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const session = await getAdminSession();
  if (session.status !== "authenticated") redirect(SESSION_EXPIRED_URL);
  return session.account;
}

/** For hospital Server Components. */
export async function requireHospital(): Promise<CurrentHospital> {
  const session = await getHospitalSession();
  if (session.status !== "authenticated") redirect(SESSION_EXPIRED_URL);
  return session.account;
}
