"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

import { setDoctorActiveAction } from "../actions/doctorActions";
import { scheduleSummary, type Doctor } from "../types/doctor";
import { DoctorDialog } from "./DoctorDialog";

function initials(name: string): string {
  return (
    name
      .replace(/^dr\.?\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "Dr"
  );
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [isPending, startTransition] = useTransition();
  const willActivate = !doctor.is_active;

  function toggle() {
    startTransition(async () => {
      const result = await setDoctorActiveAction(doctor.id, willActivate);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-4">
        {doctor.photo_url ? (
          // Hospitals paste links to any host, so next/image's allow-list doesn't fit.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doctor.photo_url}
            alt={`${doctor.full_name}`}
            referrerPolicy="no-referrer"
            className="size-14 shrink-0 rounded-full border border-line object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft text-lg font-semibold text-brand"
          >
            {initials(doctor.full_name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-ink">{doctor.full_name}</h3>
          <p className="truncate text-sm text-muted">{doctor.designation}</p>
          <span
            className={cn(
              "mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              doctor.is_active ? "bg-success-soft text-success" : "bg-canvas text-muted",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("size-1.5 rounded-full", doctor.is_active ? "bg-success" : "bg-subtle")}
            />
            {doctor.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        {[
          ["Specialization", doctor.specialization],
          ["Department", doctor.department],
          ["Qualification", doctor.qualification],
          ["Experience", `${doctor.experience_years} ${doctor.experience_years === 1 ? "year" : "years"}`],
          ["Gender", doctor.gender],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</dt>
            <dd className="mt-0.5 break-words text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-muted">
        <span className="text-xs font-semibold uppercase tracking-wide text-subtle">Schedule </span>
        {scheduleSummary(doctor) ?? "Not set — patients can't book this doctor yet"}
      </p>

      <div className="mt-auto flex justify-end gap-1 border-t border-line pt-3">
        <DoctorDialog doctor={doctor} />
        <Button
          variant={willActivate ? "ghost" : "danger"}
          size="sm"
          onClick={toggle}
          isLoading={isPending}
          aria-label={`${willActivate ? "Activate" : "Deactivate"} ${doctor.full_name}`}
        >
          {willActivate ? "Activate" : "Deactivate"}
        </Button>
      </div>
    </Card>
  );
}
