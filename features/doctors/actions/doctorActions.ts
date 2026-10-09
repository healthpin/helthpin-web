"use server";

import { revalidatePath } from "next/cache";

import { DjangoApiError } from "@/lib/api/django";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";

import { createDoctor, updateDoctor } from "../api/doctorsApi";
import type {
  ActionResult,
  DoctorField,
  DoctorFieldErrors,
  DoctorFormState,
  DoctorInput,
} from "../types/doctor";
import { TOKEN_MINUTES, tokensThatFit } from "../types/doctor";

const DOCTORS_PATH = "/hospital/doctors";
const TEXT_FIELDS = [
  "full_name",
  "photo_url",
  "gender",
  "qualification",
  "specialization",
  "department",
  "designation",
] as const;
const REQUIRED: Record<string, string> = {
  full_name: "Enter the doctor's full name.",
  gender: "Choose a gender.",
  qualification: "Enter the qualification.",
  specialization: "Choose a specialization.",
  department: "Choose a department.",
  designation: "Choose a designation.",
};

function readForm(formData: FormData): DoctorInput {
  const text = (name: string) => String(formData.get(name) ?? "").replace(/\s+/g, " ").trim();
  const years = text("experience_years");
  return {
    ...(Object.fromEntries(TEXT_FIELDS.map((name) => [name, text(name)])) as Omit<
      DoctorInput,
      "experience_years" | "is_active" | "working_days" | "start_time" | "end_time" | "token_count"
    >),
    experience_years: years === "" ? null : Number(years),
    is_active: text("is_active") !== "inactive",
    working_days: formData.getAll("working_days").map(Number).filter((d) => d >= 0 && d <= 6),
    start_time: text("start_time"),
    end_time: text("end_time"),
    token_count: text("token_count") === "" ? null : Number(text("token_count")),
  };
}

function validate(input: DoctorInput): DoctorFieldErrors {
  const errors: DoctorFieldErrors = {};
  for (const [field, message] of Object.entries(REQUIRED)) {
    if (!input[field as DoctorField]) errors[field as DoctorField] = message;
  }
  const years = input.experience_years;
  if (years === null || !Number.isInteger(years) || years < 0 || years > 80)
    errors.experience_years = "Enter whole years, from 0 to 80.";
  if (input.photo_url && !/^https?:\/\//i.test(input.photo_url))
    errors.photo_url = "Enter a link starting with http:// or https://.";
  // The token schedule is all-or-nothing, and every token is 15 minutes.
  const hasSchedule =
    input.working_days.length > 0 || input.start_time || input.end_time || input.token_count !== null;
  if (hasSchedule) {
    if (!input.working_days.length) errors.working_days = "Choose at least one working day.";
    if (!input.start_time) errors.start_time = "Set the start time.";
    if (!input.end_time) errors.end_time = "Set the end time.";
    if (input.start_time && input.end_time) {
      const fits = tokensThatFit(input.start_time, input.end_time);
      if (fits < 1) errors.end_time = "End time must be after the start time.";
      else if (input.token_count !== null && input.token_count > fits)
        errors.token_count = `Only ${fits} tokens of ${TOKEN_MINUTES} minutes fit in this time.`;
    }
    if (input.token_count === null || !Number.isInteger(input.token_count) || input.token_count < 1)
      errors.token_count ??= "Enter how many tokens per day.";
  }
  return errors;
}

/** Django error -> form state (field errors for 400s, a banner otherwise). */
function toFormState(error: unknown): DoctorFormState {
  if (!(error instanceof DjangoApiError)) throw error;
  if (error.code === "validation_error" && error.fieldErrors) {
    const fieldErrors: DoctorFieldErrors = {};
    for (const [field, messages] of Object.entries(error.fieldErrors)) {
      if (messages?.length) fieldErrors[field as DoctorField] = messages.join(" ");
    }
    if (Object.keys(fieldErrors).length) return { fieldErrors };
  }
  if (error.isForbidden) return { message: "Only hospital accounts can manage doctors." };
  return { message: error.message };
}

/** Cleared times are sent as null, which is how Django stores "no schedule". */
function payload(input: DoctorInput) {
  return { ...input, start_time: input.start_time || null, end_time: input.end_time || null };
}

/** Add (no id) or edit (id) a doctor; bound with `.bind(null, id)` by the form. */
export async function saveDoctorAction(
  doctorId: number | null,
  _previous: DoctorFormState,
  formData: FormData,
): Promise<DoctorFormState> {
  const input = readForm(formData);
  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  try {
    const doctor = await withHospitalToken((token) =>
      doctorId === null ? createDoctor(token, payload(input)) : updateDoctor(token, doctorId, payload(input)),
    );
    revalidatePath(DOCTORS_PATH);
    return {
      successAt: Date.now(),
      successMessage: `${doctor.full_name} was ${doctorId === null ? "added" : "updated"}.`,
    };
  } catch (error) {
    return toFormState(error);
  }
}

export async function setDoctorActiveAction(doctorId: number, active: boolean): Promise<ActionResult> {
  try {
    const doctor = await withHospitalToken((token) => updateDoctor(token, doctorId, { is_active: active }));
    revalidatePath(DOCTORS_PATH);
    return { ok: true, message: `${doctor.full_name} is now ${active ? "active" : "inactive"}.` };
  } catch (error) {
    if (error instanceof DjangoApiError) return { ok: false, message: error.message };
    throw error;
  }
}
