"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { toast } from "@/components/ui/toast";
import type { Booking } from "@/features/bookings/types/booking";
import { formatDate } from "@/features/bookings/types/booking";

import { removePrescriptionAction } from "../actions/prescriptionActions";
import {
  ACCEPTED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  type HospitalPrescription,
} from "../types/prescription";

const VIEW_URL = (id: string) => `/api/hospital/prescriptions/${id}/file`;

/** Today at the hospital (bookings use India time). A hint only: Django decides. */
function todayIso(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function validate(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "Choose a PDF, JPEG, PNG or WebP file.";
  }
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "The file is too large. The limit is 10 MB.";
  return null;
}

interface UploadResult {
  ok: boolean;
  message: string;
}

/** POSTs the file to this app's own route (which forwards it to Django), reporting progress. */
function uploadFile(
  form: FormData,
  onProgress: (percent: number) => void,
  signal: { current: XMLHttpRequest | null },
  onSessionExpired: () => void,
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    signal.current = request;
    request.open("POST", "/api/hospital/prescriptions");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      let body: { message?: string; code?: string } = {};
      try {
        body = JSON.parse(request.responseText);
      } catch {
        /* keep the generic message */
      }
      if (request.status === 401) {
        onSessionExpired();
        return resolve({ ok: false, message: "Your session has expired." });
      }
      const ok = request.status >= 200 && request.status < 300;
      resolve({ ok, message: body.message ?? (ok ? "Prescription uploaded." : "The upload failed. Please try again.") });
    };
    request.onerror = () => resolve({ ok: false, message: "Can't reach the server. Check your connection and try again." });
    request.onabort = () => resolve({ ok: false, message: "Upload cancelled." });
    request.send(form);
  });
}

/**
 * Upload / view / remove the prescription for one appointment. The buttons
 * only reflect what is likely allowed; the server checks that the appointment
 * is this hospital's, not cancelled, and not in the future.
 */
export function PrescriptionAction({
  booking,
  prescription,
  onChanged,
}: {
  booking: Booking;
  prescription?: HospitalPrescription;
  onChanged?: () => void;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [isRemoving, startRemoving] = useTransition();
  const request = useRef<XMLHttpRequest | null>(null);
  const router = useRouter();
  const fieldId = useId();
  const uploading = progress !== null;

  const closeUpload = useCallback(() => {
    request.current?.abort();
    setUploadOpen(false);
    setFile(null);
    setName("");
    setError(null);
    setProgress(null);
  }, []);

  if (booking.status === "Cancelled") return null;

  if (prescription) {
    return (
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        <a
          href={VIEW_URL(prescription.id)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${booking.patient_name}'s prescription`}
          className="inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink hover:bg-canvas"
        >
          View prescription
        </a>
        <Button size="sm" variant="ghost" onClick={() => setRemoveOpen(true)} aria-label={`Remove ${booking.patient_name}'s prescription`}>
          Remove
        </Button>
        <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)} title="Remove this prescription?">
          <p className="text-sm text-muted">
            It will also disappear from {booking.patient_name}&apos;s Health Pin Vault. You can upload a corrected one afterwards.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setRemoveOpen(false)} disabled={isRemoving}>
              Keep it
            </Button>
            <Button
              variant="danger"
              isLoading={isRemoving}
              onClick={() =>
                startRemoving(async () => {
                  const result = await removePrescriptionAction(prescription.id);
                  if (result.ok) toast.success(result.message);
                  else toast.error(result.message);
                  setRemoveOpen(false);
                  onChanged?.();
                })
              }
            >
              Remove
            </Button>
          </div>
        </Dialog>
      </div>
    );
  }

  if (booking.booking_date > todayIso()) {
    return <p className="mb-2 text-right text-xs text-subtle">A prescription can be added from the appointment day.</p>;
  }

  async function submit() {
    if (!file) return setError("Choose a file to upload.");
    const problem = validate(file);
    if (problem) return setError(problem);
    setError(null);
    setProgress(0);

    const form = new FormData();
    form.set("booking_id", String(booking.booking_id));
    form.set("file", file, file.name);
    if (name.trim()) form.set("name", name.trim());

    const result = await uploadFile(form, setProgress, request, () => router.push("/login?expired=1"));
    request.current = null;
    setProgress(null);
    if (result.ok) {
      toast.success(result.message);
      setUploadOpen(false);
      setFile(null);
      setName("");
      onChanged?.();
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="mb-2 flex justify-end">
      <Button size="sm" variant="secondary" onClick={() => setUploadOpen(true)} aria-label={`Upload prescription for ${booking.patient_name}`}>
        Upload prescription
      </Button>
      <Dialog
        open={uploadOpen}
        onClose={closeUpload}
        title="Upload prescription"
        description={`${booking.patient_name} · ${booking.doctor_name} · ${formatDate(booking.booking_date)}. It will appear in the patient's Health Pin Vault.`}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor={`${fieldId}-file`} className="mb-1.5 block text-sm font-medium text-ink">
              File (PDF, JPEG, PNG or WebP, up to 10 MB)
            </label>
            <input
              id={`${fieldId}-file`}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              disabled={uploading}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError(null);
              }}
              className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-line file:bg-surface file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink"
            />
          </div>
          <div>
            <label htmlFor={`${fieldId}-name`} className="mb-1.5 block text-sm font-medium text-ink">
              Title (optional)
            </label>
            <input
              id={`${fieldId}-name`}
              value={name}
              maxLength={60}
              disabled={uploading}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Fever treatment"
              className="h-10 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
          </div>
          {uploading && (
            <div aria-live="polite">
              <progress value={progress ?? 0} max={100} className="h-2 w-full accent-brand" aria-label="Upload progress" />
              <p className="mt-1 text-xs text-muted">{progress === 100 ? "Saving…" : `Uploading… ${progress}%`}</p>
            </div>
          )}
          {error && <Alert>{error}</Alert>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeUpload}>
              {uploading ? "Cancel upload" : "Close"}
            </Button>
            <Button type="submit" isLoading={uploading} disabled={!file}>
              Upload
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
