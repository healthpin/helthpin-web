"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

import { updateDirectoryHospitalAction, type EditHospitalState } from "../actions/directoryActions";
import { DIRECTORY_FIELDS } from "../fields";
import type { DirectoryHospital } from "../types/directory";

const initialState: EditHospitalState = {};

function EditHospitalForm({
  hospital,
  onDone,
}: {
  hospital: DirectoryHospital;
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    updateDirectoryHospitalAction.bind(null, hospital.id),
    initialState,
  );
  const handledSuccess = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (state.successAt && state.successAt !== handledSuccess.current) {
      handledSuccess.current = state.successAt;
      toast.success("Hospital details updated.");
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.message && <Alert>{state.message}</Alert>}

      <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
        {DIRECTORY_FIELDS.map(({ name, label, multiline }) =>
          multiline ? (
            <div key={name} className="flex flex-col gap-1.5">
              <label htmlFor={`edit-${name}`} className="text-sm font-medium text-ink">
                {label}
              </label>
              <textarea
                id={`edit-${name}`}
                name={name}
                rows={3}
                defaultValue={hospital[name]}
                disabled={isPending}
                className={cn(
                  "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:ring-4",
                  state.fieldErrors?.[name]
                    ? "border-danger focus:border-danger focus:ring-danger/15"
                    : "border-line focus:border-brand focus:ring-brand/15",
                )}
              />
              {state.fieldErrors?.[name] && (
                <p className="text-sm text-danger">{state.fieldErrors[name]}</p>
              )}
            </div>
          ) : (
            <TextField
              key={name}
              id={`edit-${name}`}
              label={label}
              name={name}
              defaultValue={hospital[name]}
              error={state.fieldErrors?.[name]}
              disabled={isPending}
            />
          ),
        )}
      </div>

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function EditHospitalButton({ hospital }: { hospital: DirectoryHospital }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title="Edit hospital"
        description="Update this hospital's directory details."
      >
        {/* Mounted only while open, so each opening starts from the saved values. */}
        {open && <EditHospitalForm hospital={hospital} onDone={close} />}
      </Dialog>
    </>
  );
}
