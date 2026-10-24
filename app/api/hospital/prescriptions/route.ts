import { NextResponse, type NextRequest } from "next/server";

import { failure, hospitalRoute } from "@/lib/auth/hospitalRoute";
import { serverEnv } from "@/lib/config/env";

/** Same limit as the backend (PRESCRIPTION_MAX_UPLOAD_MB); Django decides. */
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Upload a prescription for one appointment. The browser posts here (so it can
 * show upload progress) and this forwards the file to Django with the
 * hospital's token. Django alone decides whether the appointment qualifies;
 * the response carries only the saved prescription's details.
 */
export function POST(request: NextRequest) {
  return hospitalRoute(request, async (accessToken) => {
    let incoming: FormData;
    try {
      incoming = await request.formData();
    } catch {
      return failure(400, "invalid_request", "The upload could not be read.");
    }
    const file = incoming.get("file");
    const bookingId = String(incoming.get("booking_id") ?? "");
    if (!(file instanceof File) || !/^\d{1,12}$/.test(bookingId)) {
      return failure(400, "invalid_request", "Choose an appointment and a file to upload.");
    }
    if (file.size > MAX_BYTES) {
      return failure(413, "file_too_large", "The file is too large. The limit is 10 MB.");
    }

    const outgoing = new FormData();
    outgoing.set("booking_id", bookingId);
    outgoing.set("file", file, file.name);
    outgoing.set("name", String(incoming.get("name") ?? "").slice(0, 60));

    let response: Response;
    try {
      response = await fetch(`${serverEnv.apiBaseUrl}/hospital/prescriptions/`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
        body: outgoing,
        cache: "no-store",
        signal: AbortSignal.timeout(60_000),
      });
    } catch {
      return failure(502, "network_error", "Can't reach the Health Pin API. Please try again shortly.");
    }

    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    return NextResponse.json(
      {
        success: response.ok,
        code: data?.code,
        message: data?.message ?? (response.ok ? "Prescription uploaded" : "The upload failed. Please try again."),
        prescription: data?.prescription,
      },
      { status: response.status },
    );
  });
}
