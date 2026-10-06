import "server-only";

import { djangoFetch } from "@/lib/api/django";

import type {
  AdminUser,
  CurrentAdminResponse,
  LoginResponse,
} from "../types/auth";

/** Authentication endpoints of the Django API. Server-only. */

/** Shared login for Super Admins and hospitals; the account decides the role. */
export function loginRequest(
  email: string,
  password: string,
  clientIp: string | null,
): Promise<LoginResponse> {
  return djangoFetch<LoginResponse>("/auth/login/", {
    method: "POST",
    body: { email, password },
    clientIp,
  });
}

export async function fetchCurrentAdmin(accessToken: string): Promise<AdminUser> {
  const data = await djangoFetch<CurrentAdminResponse>("/admin/auth/me/", { accessToken });
  return data.admin;
}

/** Blacklists the refresh token. Best effort: the cookies are cleared anyway. */
export async function logoutRequest(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await djangoFetch("/auth/logout/", {
      method: "POST",
      body: { refresh: refreshToken },
      accessToken,
    });
  } catch {
    // Expired token or API down: nothing more to revoke from here.
  }
}
