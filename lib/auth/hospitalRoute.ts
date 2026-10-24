import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, sessionCookies, type SessionTokens } from "./cookies";
import { getTokenRole, isTokenExpired } from "./jwt";
import { refreshSessionTokens } from "./refresh";

/**
 * Wraps a Route Handler that acts as the signed-in hospital.
 *
 * Pages are covered by proxy.ts, but it skips /api, so this does the same
 * job here: it refuses other account types, swaps an expired access token for
 * a new pair (writing the new cookies back), and for changes checks that the
 * request really comes from this site. Django's IsHospital permission is what
 * actually authorizes the call; the browser never sees a token.
 */
export async function hospitalRoute(
  request: NextRequest,
  handler: (accessToken: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.nextUrl.host) {
      return failure(403, "forbidden", "This request was not made from the dashboard.");
    }
  }

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!refresh || isTokenExpired(refresh, 0) || getTokenRole(refresh) !== "hospital") {
    return failure(401, "session_expired", "Your session has expired. Please sign in again.");
  }

  let renewed: SessionTokens | null = null;
  if (!access || isTokenExpired(access)) {
    try {
      renewed = await refreshSessionTokens(refresh);
      access = renewed.access;
    } catch {
      return failure(401, "session_expired", "Your session has expired. Please sign in again.");
    }
  }

  const response = await handler(access);
  if (renewed) {
    for (const cookie of sessionCookies(renewed)) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
  }
  return response;
}

export function failure(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ success: false, code, message }, { status });
}
