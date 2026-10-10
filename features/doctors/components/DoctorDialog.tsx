"use client";

import { useActionState, useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PlusIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

import { saveDoctorAction } from "../actions/doctorActions";
import { TimePicker } from "./TimePicker";
import { DEPARTMENTS, DESIGNATIONS, SPECIALIZATIONS } from "../options";
import {
  GENDERS,
  hhmm,
  TOKEN_MINUTES,
  tokensThatFit,
  WEEKDAYS,
  type Doctor,
  type DoctorField,
  type DoctorFormState,
} from "../types/doctor";

const initialState: DoctorFormState = {};

function SelectField({
  label,
  name,
  error,
  disabled,
  value,
  onChange,
  placeholder,
  children,
}: {
  label: string;
  name: DoctorField;
  error?: string;
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`doctor-${name}`} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={`doctor-${name}`}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `doctor-${name}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-lg border bg-surface px-3 text-[15px] text-ink outline-none transition focus:ring-4",
          error
            ? "border-danger focus:border-danger focus:ring-danger/15"
            : "border-line focus:border-brand focus:ring-brand/15",
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {error && <p id={`doctor-${name}-error`} className="text-sm text-danger">{error}</p>}
    </div>
  );
}

/** The list's options, plus the doctor's saved value if it predates the list. */
function Options({ values, current }: { values: readonly string[]; current?: string }) {
  const all = current && !values.includes(current) ? [current, ...values] : values;
  return all.map((value) => (
    <option key={value} value={value}>
      {value}
    </option>
  ));
}

function DoctorForm({ doctor, onDone }: { doctor?: Doctor; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState(
    saveDoctorAction.bind(null, doctor?.id ?? null),
    initialState,
  );
  const handledSuccess = useRef<number | undefined>(undefined);
  const errors = state.fieldErrors ?? {};
  const [start, setStart] = useState(hhmm(doctor?.start_time ?? null));
  const [end, setEnd] = useState(hhmm(doctor?.end_time ?? null));
  const [days, setDays] = useState<number[]>(doctor?.working_days ?? []);
  const [values, setValues] = useState<Record<string, string>>({
    full_name: doctor?.full_name ?? "",
    photo_url: doctor?.photo_url ?? "",
    gender: doctor?.gender ?? "",
    qualification: doctor?.qualification ?? "",
    specialization: doctor?.specialization ?? "",
    experience_years: String(doctor?.experience_years ?? ""),
    department: doctor?.department ?? "",
    designation: doctor?.designation ?? "",
    is_active: doctor && !doctor.is_active ? "inactive" : "active",
    token_count: String(doctor?.token_count ?? ""),
  });
  const field = (name: string) => ({
    value: values[name],
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, [name]: event.target.value })),
  });
  const select = (name: string) => ({
    value: values[name],
    onChange: (value: string) => setValues((current) => ({ ...current, [name]: value })),
  });
  const formRef = useRef<HTMLFormElement>(null);
  const fits = tokensThatFit(start, end);

  useEffect(() => {
    if (state.fieldErrors) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus();
    }
  }, [state]);

  useEffect(() => {
    if (state.successAt && state.successAt !== handledSuccess.current) {
      handledSuccess.current = state.successAt;
      toast.success(state.successMessage ?? "Saved.");
      onDone();
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      {state.message && <Alert>{state.message}</Alert>}

      <div className="flex flex-col gap-4">
        <TextField
          label="Full name"
          name="full_name"
          placeholder="Dr. Asha Nair"
          {...field("full_name")}
          error={errors.full_name}
          disabled={isPending}
          maxLength={200}
          autoFocus
        />
        <TextField
          label="Profile photo link (optional)"
          name="photo_url"
          type="url"
          inputMode="url"
          placeholder="https://example.com/photo.jpg"
          {...field("photo_url")}
          error={errors.photo_url}
          disabled={isPending}
          maxLength={500}
        />
        <SelectField
          label="Gender"
          name="gender"
          {...select("gender")}
          placeholder="Select gender"
          error={errors.gender}
          disabled={isPending}
        >
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Qualification"
          name="qualification"
          placeholder="MBBS, MD"
          {...field("qualification")}
          error={errors.qualification}
          disabled={isPending}
          maxLength={200}
        />
        <SelectField
          label="Specialization"
          name="specialization"
          {...select("specialization")}
          placeholder="Select specialization"
          error={errors.specialization}
          disabled={isPending}
        >
          <Options values={SPECIALIZATIONS} current={doctor?.specialization} />
        </SelectField>
        <TextField
          label="Years of experience"
          name="experience_years"
          type="number"
          inputMode="numeric"
          min={0}
          max={80}
          step={1}
          {...field("experience_years")}
          error={errors.experience_years}
          disabled={isPending}
        />
        <SelectField
          label="Department"
          name="department"
          {...select("department")}
          placeholder="Select department"
          error={errors.department}
          disabled={isPending}
        >
          <Options values={DEPARTMENTS} current={doctor?.department} />
        </SelectField>
        <SelectField
          label="Designation"
          name="designation"
          {...select("designation")}
          placeholder="Select designation"
          error={errors.designation}
          disabled={isPending}
        >
          <Options values={DESIGNATIONS} current={doctor?.designation} />
        </SelectField>
        <SelectField
          label="Availability status"
          name="is_active"
          {...select("is_active")}
          error={errors.is_active}
          disabled={isPending}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectField>

        <fieldset className="flex flex-col gap-3 rounded-lg border border-line p-4">
          <legend className="px-1 text-sm font-semibold text-ink">Token schedule</legend>
          <p className="text-sm text-muted">
            Patients book tokens of {TOKEN_MINUTES} minutes each. Leave empty if this doctor
            shouldn&apos;t take bookings yet.
          </p>
          <div>
            <div className={cn("flex flex-wrap gap-2 rounded-lg", errors.working_days && "p-2 ring-1 ring-danger")} role="group" aria-label="Working days">
              <button
                type="button"
                aria-pressed={days.length === WEEKDAYS.length}
                disabled={isPending}
                onClick={() => setDays(days.length === WEEKDAYS.length ? [] : WEEKDAYS.map((_, index) => index))}
                className={cn("rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand", days.length === WEEKDAYS.length ? "border-brand bg-brand-soft text-brand" : "border-line text-ink")}
              >
                All Day
              </button>
              {WEEKDAYS.map((day, index) => (
                <label
                  key={day}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand"
                >
                  <input
                    type="checkbox"
                    name="working_days"
                    value={index}
                    checked={days.includes(index)}
                    onChange={(event) => setDays((current) => event.target.checked ? [...current, index].sort() : current.filter((value) => value !== index))}
                    aria-invalid={errors.working_days ? true : undefined}
                    aria-describedby={errors.working_days ? "doctor-working-days-error" : undefined}
                    disabled={isPending}
                    className="sr-only"
                  />
                  {day}
                </label>
              ))}
            </div>
            {errors.working_days && <p id="doctor-working-days-error" className="mt-1.5 text-sm text-danger">{errors.working_days}</p>}
          </div>
          <p className="text-xs text-muted">All Day selects every day of the week. Choose booking hours below.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TimePicker
              label="Start time"
              name="start_time"
              value={start}
              onChange={setStart}
              error={errors.start_time}
              disabled={isPending}
            />
            <TimePicker
              label="End time"
              name="end_time"
              value={end}
              onChange={setEnd}
              error={errors.end_time}
              disabled={isPending}
            />
          </div>
          <TextField
            label="Tokens per day"
            name="token_count"
            type="number"
            inputMode="numeric"
            min={1}
            max={Math.max(fits, 1)}
            step={1}
            {...field("token_count")}
            error={errors.token_count}
            hint={fits > 0 ? `Up to ${fits} tokens fit between these times.` : undefined}
            disabled={isPending}
          />
        </fieldset>
      </div>

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isPending ? "Saving…" : doctor ? "Save changes" : "Add doctor"}
        </Button>
      </div>
    </form>
  );
}

/** Opens the Add (no doctor) or Edit (with doctor) form in a modal. */
export function DoctorDialog({ doctor }: { doctor?: Doctor }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {doctor ? (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={`Edit ${doctor.full_name}`}>
          Edit
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)} leadingIcon={<PlusIcon width={18} height={18} />}>
          Add Doctor
        </Button>
      )}
      <Dialog
        open={open}
        onClose={close}
        title={doctor ? "Edit doctor" : "Add doctor"}
        description={doctor ? undefined : "The doctor will be listed under your hospital."}
      >
        {/* Mounted only while open, so each opening starts from the saved values. */}
        {open && <DoctorForm doctor={doctor} onDone={close} />}
      </Dialog>
    </>
  );
}
