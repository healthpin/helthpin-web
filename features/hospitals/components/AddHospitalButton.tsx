"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PlusIcon } from "@/components/ui/icons";

import { HospitalForm } from "./HospitalForm";

export function AddHospitalButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button onClick={() => setOpen(true)} leadingIcon={<PlusIcon width={18} height={18} />}>
        Add Hospital
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title="Add hospital"
        description="The hospital will sign in with this email and password."
      >
        {/* Mounted only while open, so each opening starts with an empty form. */}
        {open && <HospitalForm onDone={close} />}
      </Dialog>
    </>
  );
}
