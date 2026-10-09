"use client";

import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

import { setPartnerStatusAction } from "../actions/partnerActions";
import type { Partner } from "../types/partner";
import { PartnerForm } from "./PartnerForm";
import { PartnerPasswordForm } from "./PartnerPasswordForm";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        active ? "bg-success-soft text-success" : "bg-canvas text-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-subtle")}
      />
      {active ? "Active partner" : "Inactive partner"}
    </span>
  );
}

/** Partner login details with edit, change password and activate/deactivate. */
export function PartnerPanel({ partner, hospitalName }: { partner: Partner; hospitalName: string }) {
  const directoryId = partner.hospital_directory_id;
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const closeEdit = useCallback(() => setEditing(false), []);
  const closePassword = useCallback(() => setChangingPassword(false), []);
  const willActivate = !partner.is_active;

  function changeStatus() {
    startTransition(async () => {
      const result = await setPartnerStatusAction(directoryId, willActivate);
      setConfirming(false);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <Card className="p-6 lg:col-span-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">Partner</h3>
        <StatusBadge active={partner.is_active} />
      </div>
      <dl className="grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">Login email</dt>
          <dd className="mt-1 break-words text-sm text-ink">{partner.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">Category</dt>
          <dd className="mt-1 text-sm text-ink">
            {partner.category}
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
          Edit partner
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setChangingPassword(true)}>
          Change password
        </Button>
        <Button
          variant={willActivate ? "primary" : "danger"}
          size="sm"
          onClick={() => setConfirming(true)}
        >
          {willActivate ? "Activate" : "Deactivate"}
        </Button>
      </div>

      <Dialog open={editing} onClose={closeEdit} title="Edit partner">
        {editing && <PartnerForm directoryId={directoryId} partner={partner} onDone={closeEdit} />}
      </Dialog>

      <Dialog
        open={changingPassword}
        onClose={closePassword}
        title="Change password"
        description={`Set a new sign-in password for ${hospitalName}. They will be signed out everywhere and must use the new password.`}
      >
        {changingPassword && <PartnerPasswordForm directoryId={directoryId} onDone={closePassword} />}
      </Dialog>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={willActivate ? "Activate partner?" : "Deactivate partner?"}
      >
        <p className="text-sm text-muted">
          {willActivate
            ? `${hospitalName} will be able to sign in again.`
            : `${hospitalName} will be signed out and won't be able to sign in. The partner record is kept and can be activated again.`}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirming(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={willActivate ? "primary" : "danger"}
            onClick={changeStatus}
            isLoading={isPending}
          >
            {willActivate ? "Activate" : "Deactivate"}
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
