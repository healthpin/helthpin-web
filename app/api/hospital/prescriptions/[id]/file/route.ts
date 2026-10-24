import { NextResponse, type NextRequest } from "next/server";

import { failure, hospitalRoute } from "@/lib/auth/hospitalRoute";
import { serverEnv } from "@/lib/config/env";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

/**
 * View a prescription this hospital uploaded. The file is streamed through
 * Django, so no storage address or link ever reaches the browser, and Django
 * only serves it to the hospital that uploaded it.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/hospital/prescriptions/[id]/file">) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return failure(404, "not_found", "Not found.");

  return hospitalRoute(request, async (accessToken) => {
    let response: Response;
    try {
      response = await fetch(`${serverEnv.apiBaseUrl}/hospital/prescriptions/${id}/file/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      return failure(502, "network_error", "Can't reach the Health Pin API. Please try again shortly.");
    }
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { code?: string; message?: string } | null;
      return failure(response.status, data?.code ?? "error", data?.message ?? "The prescription could not be opened.");
    }

    const type = response.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!ALLOWED_TYPES.has(type)) return failure(502, "error", "The prescription could not be opened.");
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": type,
        "Content-Disposition": response.headers.get("content-disposition") ?? "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox; default-src 'none'",
      },
    });
  });
}
