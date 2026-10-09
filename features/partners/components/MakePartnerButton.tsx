"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PlusIcon } from "@/components/ui/icons";

import { PartnerForm } from "./PartnerForm";

export function MakePartnerButton({
  directoryId,
  hospitalName,
}: {
  directoryId: number;
  hospitalName: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button onClick={() => setOpen(true)} leadingIcon={<PlusIcon width={18} height={18} />}>
        Make Partner
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title="Make partner"
        description={`Create the sign-in for ${hospitalName}. They will use this email and password.`}
      >
        {/* Mounted only while open, so each opening starts with an empty form. */}
        {open && <PartnerForm directoryId={directoryId} onDone={close} />}
      </Dialog>
    </>
  );
}
