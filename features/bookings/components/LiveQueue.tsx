"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { UsersIcon } from "@/components/ui/icons";

import { fetchLiveQueueAction } from "../actions/bookingActions";
import {
  formatDate,
  formatTime,
  formatWait,
  type DoctorQueue,
  type LiveQueue as LiveQueueData,
} from "../types/booking";
import { BookingActions } from "./BookingActions";
import { BookingStatusBadge } from "./BookingStatusBadge";

const REFRESH_MS = 15_000;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}

function DoctorQueueCard({
  doctor,
  date,
  onChanged,
}: {
  doctor: DoctorQueue;
  date: string;
  onChanged: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{doctor.doctor_name}</h3>
          <p className="text-sm text-muted">{doctor.specialization}</p>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">
          {doctor.now_serving === null ? "Queue empty" : `Now serving token ${doctor.now_serving}`}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-4">
        <Stat label="Waiting" value={String(doctor.waiting)} />
        <Stat label="Seen so far" value={`${doctor.completed} of ${doctor.total_tokens}`} />
        <Stat label="A new patient waits" value={formatWait(doctor.queue_clears_in_minutes)} />
      </dl>

      {doctor.queue.length > 0 && (
        <ol className="mt-4 divide-y divide-line rounded-lg border border-line">
          {doctor.queue.map((entry) => (
            <li
              key={entry.booking_id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas text-sm font-bold text-ink">
                  {entry.token_number}
                </span>
                <div>
                  <div className="text-sm font-medium text-ink">{entry.patient_name}</div>
                  <div className="text-xs text-muted">
                    Slot {formatTime(entry.slot_start)} ·{" "}
                    {entry.tokens_ahead === 0
                      ? "being seen now"
                      : `${entry.tokens_ahead} ahead · ~${formatWait(entry.wait_minutes)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookingStatusBadge status={entry.status} />
                <BookingActions
                  bookingId={entry.booking_id}
                  status={entry.status}
                  patientName={entry.patient_name}
                  when={{ date, time: entry.slot_start }}
                  onChanged={onChanged}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/**
 * Live queue per doctor. Shows the server-rendered queue straight away, then
 * asks for a fresh one every 15 seconds (and right after any status change),
 * pausing while the tab is hidden. Each token is [token_minutes] long, so a
 * patient with N tokens ahead waits about N x that.
 */
export function LiveQueue({ initial, date }: { initial: LiveQueueData; date?: string }) {
  const [queue, setQueue] = useState(initial);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [stale, setStale] = useState(false);
  const loading = useRef(false);

  const refresh = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const fresh = await fetchLiveQueueAction(date);
      if (fresh) {
        setQueue(fresh);
        setUpdatedAt(new Date());
      }
      setStale(fresh === null);
    } finally {
      loading.current = false;
    }
  }, [date]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {formatDate(queue.date)} · each token is {queue.token_minutes} minutes
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted" aria-live="polite">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${stale ? "bg-danger" : "bg-success"}`}
            />
            {stale
              ? "Couldn't refresh — showing the last update"
              : `Live · updated ${updatedAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}`}
          </span>
          <Button variant="secondary" size="sm" onClick={() => void refresh()}>
            Refresh
          </Button>
        </div>
      </div>

      {queue.doctors.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersIcon}
            title="No bookings for this day"
            description="Patients' tokens will appear here as soon as they book."
          />
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {queue.doctors.map((doctor) => (
            <DoctorQueueCard key={doctor.doctor_id} doctor={doctor} date={queue.date} onChanged={() => void refresh()} />
          ))}
        </div>
      )}
    </>
  );
}
