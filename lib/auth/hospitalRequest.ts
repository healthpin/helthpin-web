import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DjangoApiError } from "@/lib/api/django";

import { ACCESS_COOKIE } from "./cookies";
import { SESSION_EXPIRED_URL } from "./session";

/**
 * Runs a Django call with the signed-in hospital's access token (pages and
 * Server Actions). proxy.ts has already refreshed an expired token; if Django
 * still says 401, the session is over and the hospital goes back to /login.
 * Django's IsHospital permission is what actually authorizes the call.
 */
export async function withHospitalToken<T>(call: (accessToken: string) => Promise<T>): Promise<T> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect(SESSION_EXPIRED_URL);
  try {
    return await call(accessToken);
  } catch (error) {
    if (error instanceof DjangoApiError && error.isUnauthorized) redirect(SESSION_EXPIRED_URL);
    throw error;
  }
}
