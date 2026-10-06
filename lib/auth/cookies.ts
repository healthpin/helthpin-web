import { getTokenExpiry } from "./jwt";

/**
 * The admin session lives in two httpOnly cookies, so page JavaScript can
 * never read the JWTs (an XSS bug can't steal them). No Node-only imports:
 * shared by proxy.ts, Server Actions and Route Handlers.
 */
export const ACCESS_COOKIE = "hp_admin_access";
export const REFRESH_COOKIE = "hp_admin_refresh";

export interface SessionTokens {
  access: string;
  refresh: string;
}

export interface CookieToSet {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    secure: boolean;
    sameSite: "lax";
    path: "/";
    maxAge: number;
  };
}

function secondsUntil(token: string, fallback: number): number {
  const exp = getTokenExpiry(token);
  if (exp === null) return fallback;
  return Math.max(0, Math.floor(exp - Date.now() / 1000));
}

/** Cookies for a fresh session; each lives exactly as long as its token. */
export function sessionCookies(tokens: SessionTokens): CookieToSet[] {
  const secure = process.env.NODE_ENV === "production";
  const base = { httpOnly: true, secure, sameSite: "lax", path: "/" } as const;
  return [
    {
      name: ACCESS_COOKIE,
      value: tokens.access,
      options: { ...base, maxAge: secondsUntil(tokens.access, 15 * 60) },
    },
    {
      name: REFRESH_COOKIE,
      value: tokens.refresh,
      options: { ...base, maxAge: secondsUntil(tokens.refresh, 7 * 24 * 3600) },
    },
  ];
}
