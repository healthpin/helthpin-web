import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

/**
 * Server Components can't change cookies, so when the session check finds a
 * dead session it redirects here: clear both cookies, then go to /login.
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login?expired=1", request.url));
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
