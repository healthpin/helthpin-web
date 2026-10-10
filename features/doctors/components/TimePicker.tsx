"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils/cn";

function displayTime(value: string) {
  if (!value) return "Choose time";
  const [hour, minute] = value.split(":");
  return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? "PM" : "AM"}`;
}

/** A keyboard-accessible time dialog; only Apply changes the form value. */
export function TimePicker({ label, name, value, onChange, error, disabled }: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const draft = `${String(Number(hour) % 12 + (period === "PM" ? 12 : 0)).padStart(2, "0")}:${minute}`;
  const controlClass = "h-14 w-full rounded-xl border border-line bg-surface px-3 text-xl text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        data-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn("flex h-11 items-center justify-between rounded-lg border bg-surface px-3.5 text-left text-[15px] focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:opacity-60", error ? "border-danger" : "border-line", value ? "text-ink" : "text-muted")}
        onClick={() => {
          const [h, m] = (value || "09:00").split(":");
          setHour(String(Number(h) % 12 || 12));
          setMinute(m);
          setPeriod(Number(h) >= 12 ? "PM" : "AM");
          setOpen(true);
        }}
      >
        {displayTime(value)}
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      </button>
      {error && <p id={`${id}-error`} className="text-sm text-danger">{error}</p>}
      <Dialog open={open} onClose={() => setOpen(false)} title={`Choose ${label.toLowerCase()}`} description="Select the hour, minute and AM or PM.">
        <div className="mb-5 rounded-xl bg-brand-soft p-5 text-center text-3xl font-semibold text-brand" aria-live="polite">{displayTime(draft)}</div>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-2 text-sm font-medium">Hour
            <select value={hour} onChange={(event) => setHour(event.target.value)} className={controlClass}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">Minute
            <select value={minute} onChange={(event) => setMinute(event.target.value)} className={controlClass}>
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">Period
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className={controlClass}>
              <option>AM</option><option>PM</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={() => { onChange(""); setOpen(false); }}>Clear</Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onChange(draft); setOpen(false); }}>Apply time</Button>
        </div>
      </Dialog>
    </div>
  );
}
