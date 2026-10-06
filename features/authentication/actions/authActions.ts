"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { DjangoApiError } from "@/lib/api/django";
import { ACCESS_COOKIE, REFRESH_COOKIE, sessionCookies } from "@/lib/auth/cookies";
import { isPathAllowedFor, ROLE_HOME } from "@/lib/auth/roles";

import { loginRequest, logoutRequest } from "../api/authApi";
import type { LoginFormState } from "../types/auth";
import { hasErrors, safeRedirectPath, validateLoginInput } from "../validation";

async function clientIp(): Promise<string | null> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip")
  );
}

/**
 * Login form submit, for Super Admins and hospitals alike. Runs on the
 * Next.js server; the password goes straight to Django, and the account's
 * role (from Django) decides where to go.
 */
export async function loginAction(
  _previous: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requested = safeRedirectPath(formData.get("next"));

  const fieldErrors = validateLoginInput(email, password);
  if (hasErrors(fieldErrors)) return { fieldErrors, email };

  let session;
  try {
    session = await loginRequest(email, password, await clientIp());
  } catch (error) {
    if (error instanceof DjangoApiError) {
      if (error.code === "validation_error" && error.fieldErrors) {
        return {
          email,
          fieldErrors: {
            email: error.fieldErrors.email?.[0],
            password: error.fieldErrors.password?.[0],
          },
        };
      }
      // invalid_credentials, throttled, network_error, ...: Django's message.
      return { email, message: error.message };
    }
    throw error;
  }

  const cookieStore = await cookies();
  for (const cookie of sessionCookies(session)) {
    cookieStore.set(cookie.name, cookie.value, cookie.options);
  }
  const role = session.user.role;
  // Honour ?next= only inside the account's own area.
  redirect(requested && isPathAllowedFor(role, requested) ? requested : ROLE_HOME[role]);
}

/** Sign out: revoke the refresh token on Django, then drop the cookies. */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  if (access && refresh) await logoutRequest(access, refresh);

  redirect("/login");
}
