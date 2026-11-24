"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { toast } from "@/components/ui/toast";

import { approveAllRegistrationsAction, type ApproveAllResult } from "../actions/registrationActions";

/** Approves every pending registration after confirmation. Django (IsSuperAdmin) authorizes it. */
export function ApproveAllButton({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [skipped, setSkipped] = useState<Extract<ApproveAllResult, { ok: true }>["skipped"]>([]);

  function close() {
    if (busy) return;
    setOpen(false);
    setError("");
  }

  async function approveAll() {
    setBusy(true);
    setError("");
    const result = await approveAllRegistrationsAction(pendingCount);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      if (result.code === "pending_list_changed") router.refresh();
      return;
    }
    toast.success(result.message);
    setOpen(false);
    setSkipped(result.skipped);
    router.refresh();
  }

  const noun = pendingCount === 1 ? "registration" : "registrations";
  return (
    <>
      <Button onClick={() => { setSkipped([]); setOpen(true); }} disabled={pendingCount === 0} title={pendingCount === 0 ? "No pending registrations" : undefined}>
        Approve All{pendingCount > 0 ? ` (${pendingCount.toLocaleString("en-IN")})` : ""}
      </Button>

      <Dialog open={open} onClose={close} title={`Approve ${pendingCount.toLocaleString("en-IN")} pending ${noun}?`} description="Approved and rejected registrations are not affected.">
        <div className="space-y-4 text-sm leading-6 text-muted">
          <p>
            Each hospital will be added to the directory, and hospitals that registered with an email and password will be able to
            log in right away. Have you reviewed these registrations? This can&apos;t be undone from this page.
          </p>
          {error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-danger">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="secondary" onClick={close} disabled={busy}>Cancel</Button>
            <Button onClick={approveAll} isLoading={busy}>Approve All</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={skipped.length > 0} onClose={() => setSkipped([])} title={`${skipped.length} could not be approved`} description="They are still pending. Review them individually.">
        <ul className="space-y-3 text-sm">
          {skipped.map((row) => (
            <li key={row.id} className="rounded-xl border border-line p-3">
              <p className="font-semibold text-ink">{row.hospital_name}</p>
              <p className="mt-1 text-muted">{row.reason}</p>
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}
