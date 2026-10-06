"use client";

import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { toast } from "@/components/ui/toast";

import { setHospitalStatusAction } from "../actions/hospitalActions";
import type { Hospital } from "../types/hospital";
import { HospitalForm } from "./HospitalForm";
import { HospitalPasswordForm } from "./HospitalPasswordForm";

/** Edit, change password and activate/deactivate for one hospital row. */
export function HospitalRowActions({ hospital }: { hospital: Hospital }) {
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const closeEdit = useCallback(() => setEditing(false), []);
  const closePassword = useCallback(() => setChangingPassword(false), []);
  const willActivate = !hospital.is_active;

  function changeStatus() {
    startTransition(async () => {
      const result = await setHospitalStatusAction(hospital.id, willActivate);
      setConfirming(false);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label={`Edit ${hospital.name}`}>
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setChangingPassword(true)}
        aria-label={`Change password for ${hospital.name}`}
      >
        Password
      </Button>
      <Button
        variant={willActivate ? "ghost" : "danger"}
        size="sm"
        onClick={() => setConfirming(true)}
        aria-label={`${willActivate ? "Activate" : "Deactivate"} ${hospital.name}`}
      >
        {willActivate ? "Activate" : "Deactivate"}
      </Button>

      <Dialog open={editing} onClose={closeEdit} title="Edit hospital">
        {editing && <HospitalForm hospital={hospital} onDone={closeEdit} />}
      </Dialog>

      <Dialog
        open={changingPassword}
        onClose={closePassword}
        title="Change password"
        description={`Set a new sign-in password for ${hospital.name}. It will be signed out everywhere and must use the new password.`}
      >
        {changingPassword && <HospitalPasswordForm hospital={hospital} onDone={closePassword} />}
      </Dialog>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={willActivate ? "Activate hospital?" : "Deactivate hospital?"}
      >
        <p className="text-sm text-muted">
          {willActivate
            ? `${hospital.name} will be able to sign in again and will appear in the Health Pin app.`
            : `${hospital.name} will be signed out, won't be able to sign in, and will be hidden from the Health Pin app. Its record is kept and can be activated again.`}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirming(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant={willActivate ? "primary" : "danger"} onClick={changeStatus} isLoading={isPending}>
            {willActivate ? "Activate" : "Deactivate"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
