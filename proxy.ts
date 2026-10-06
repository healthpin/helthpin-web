import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  sessionCookies,
  type SessionTokens,
} from "@/lib/auth/cookies";
import { getTokenRole, isTokenExpired } from "@/lib/auth/jwt";
import { refreshSessionTokens } from "@/lib/auth/refresh";
import { isPathAllowedFor, ROLE_HOME } from "@/lib/auth/roles";

/**
 * Runs before every page. Based only on the cookies (fast, no API call):
 *
 * 1. Routing: no session -> /login; signed in on /login or on the other
 *    account type's area -> that account's own dashboard
 *    (super_admin -> /dashboard, hospital -> /hospital/dashboard).
 * 2. Token refresh: an expired access token is swapped for a new pair before
 *    the page renders, so pages always get a working token.
 *
 * The role comes from the token's `role` claim. This is routing only: every
 * page then asks Django, whose permissions decide (lib/auth/session.ts).
 */

// Concurrent requests (e.g. prefetches) arriving with the same expired token
// share one refresh: refresh tokens rotate, so a second refresh would fail.
const inFlight = new Map<string, Promise<SessionTokens>>();

function refreshOnce(refreshToken: string): Promise<SessionTokens> {
  let pending = inFlight.get(refreshToken);
  if (!pending) {
    pending = refreshSessionTokens(refreshToken);
    inFlight.set(refreshToken, pending);
    // Keep the result briefly for stragglers, then forget it.
    pending.finally(() => setTimeout(() => inFlight.delete(refreshToken), 10_000)).catch(() => {});
  }
  return pending;
}

function clearSession(response: NextResponse): NextResponse {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

function toLogin(request: NextRequest): NextResponse {
  const url = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return clearSession(NextResponse.redirect(url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const hasSession = Boolean(refresh) && !isTokenExpired(refresh, 0);
  // Tokens from before roles were added have no claim: treat as signed out.
  const role = getTokenRole(refresh);

  if (pathname === "/login") {
    return hasSession && role
      ? NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
      : NextResponse.next();
  }

  // Every other matched path needs a session of the right kind.
  if (!hasSession || !role) return toLogin(request);
  if (pathname === "/" || !isPathAllowedFor(role, pathname)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }
  if (!isTokenExpired(access)) return NextResponse.next();

  let tokens: SessionTokens;
  try {
    tokens = await refreshOnce(refresh!);
  } catch {
    return toLogin(request); // refresh token revoked or expired
  }

  // Give this request the new token (the page reads request cookies) ...
  request.cookies.set(ACCESS_COOKIE, tokens.access);
  request.cookies.set(REFRESH_COOKIE, tokens.refresh);
  const response = NextResponse.next({ request: { headers: request.headers } });
  // ... and the browser too.
  for (const cookie of sessionCookies(tokens)) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except API routes, Next.js internals and static files.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|ico|webp)$).*)",
  ],
};
