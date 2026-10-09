"use client";

import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { toast } from "@/components/ui/toast";

import { cancelBookingAction } from "../actions/bookingActions";
import { formatDate, formatTime, type BookingStatus } from "../types/booking";

/**
 * Cancel, the only thing hospital staff can do to a booking: bookings are
 * confirmed automatically and finish by themselves when their time is over.
 * Shown only while the booking is still upcoming; asks before cancelling.
 * [onChanged] lets a live view refresh straight away.
 */
export function BookingActions({
  bookingId,
  status,
  patientName,
  when,
  onChanged,
}: {
  bookingId: number;
  status: BookingStatus;
  patientName: string;
  /** Shown in the confirmation, e.g. the day and slot. */
  when?: { date: string; time: string };
  onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const close = useCallback(() => setOpen(false), []);

  if (status !== "Confirmed" && status !== "Pending") return <span className="text-sm text-subtle">—</span>;

  function cancel() {
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      setOpen(false);
      onChanged?.();
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="danger"
          onClick={() => setOpen(true)}
          aria-label={`Cancel ${patientName}'s booking`}
        >
          Cancel booking
        </Button>
      </div>
      <Dialog open={open} onClose={close} title="Cancel this booking?">
        <p className="text-sm text-muted">
          {patientName}
          {when ? ` · ${formatDate(when.date)}, ${formatTime(when.time)}` : ""}. The token becomes
          free for other patients.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close} disabled={isPending}>
            Keep booking
          </Button>
          <Button variant="danger" onClick={cancel} isLoading={isPending}>
            Cancel booking
          </Button>
        </div>
      </Dialog>
    </>
  );
}
