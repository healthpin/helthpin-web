"use server";

import { revalidatePath } from "next/cache";

import { DjangoApiError } from "@/lib/api/django";
import { withAdminToken } from "@/lib/auth/adminRequest";

import {
  createHospital,
  setHospitalActive,
  setHospitalPassword,
  updateHospital,
} from "../api/hospitalsApi";
import type {
  ActionResult,
  HospitalField,
  HospitalFieldErrors,
  HospitalFormState,
  PasswordFormState,
} from "../types/hospital";
import {
  hasFieldErrors,
  normalizeHospitalInput,
  validateHospitalInput,
  validatePasswordChange,
} from "../validation";

const HOSPITALS_PATH = "/hospitals";

function readForm(formData: FormData) {
  return normalizeHospitalInput({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
}

/** Django error -> form state (field errors for 400s, a banner otherwise). */
function toFormState(error: unknown, values: { name: string; email: string }): HospitalFormState {
  if (!(error instanceof DjangoApiError)) throw error;
  if (error.code === "validation_error" && error.fieldErrors) {
    const fieldErrors: HospitalFieldErrors = {};
    for (const field of ["name", "email", "password"] as HospitalField[]) {
      const messages = error.fieldErrors[field];
      if (messages?.length) fieldErrors[field] = messages.join(" ");
    }
    if (hasFieldErrors(fieldErrors)) return { fieldErrors, values };
  }
  if (error.isForbidden) return { message: "Only Super Admins can manage hospitals.", values };
  return { message: error.message, values };
}

export async function createHospitalAction(
  _previous: HospitalFormState,
  formData: FormData,
): Promise<HospitalFormState> {
  const input = readForm(formData);
  const values = { name: input.name, email: input.email };

  const fieldErrors = validateHospitalInput(input, { requirePassword: true });
  if (hasFieldErrors(fieldErrors)) return { fieldErrors, values };

  try {
    const hospital = await withAdminToken((token) => createHospital(token, input));
    revalidatePath(HOSPITALS_PATH);
    return { successAt: Date.now(), successMessage: `${hospital.name} was added.` };
  } catch (error) {
    return toFormState(error, values);
  }
}

export async function updateHospitalAction(
  hospitalId: number,
  _previous: HospitalFormState,
  formData: FormData,
): Promise<HospitalFormState> {
  const input = readForm(formData);
  const values = { name: input.name, email: input.email };

  const fieldErrors = validateHospitalInput(input, { requirePassword: false });
  if (hasFieldErrors(fieldErrors)) return { fieldErrors, values };

  try {
    const hospital = await withAdminToken((token) =>
      updateHospital(token, hospitalId, { name: input.name, email: input.email }),
    );
    revalidatePath(HOSPITALS_PATH);
    return { successAt: Date.now(), successMessage: `${hospital.name} was updated.` };
  } catch (error) {
    return toFormState(error, values);
  }
}

/** Set a new password for a hospital. The password is never echoed back. */
export async function changeHospitalPasswordAction(
  hospitalId: number,
  _previous: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fieldErrors = validatePasswordChange(password, confirm);
  if (fieldErrors.password || fieldErrors.confirm) return { fieldErrors };

  try {
    const hospital = await withAdminToken((token) =>
      setHospitalPassword(token, hospitalId, password),
    );
    return {
      successAt: Date.now(),
      successMessage: `Password updated for ${hospital.name}. It has been signed out everywhere.`,
    };
  } catch (error) {
    if (!(error instanceof DjangoApiError)) throw error;
    const messages = error.fieldErrors?.password;
    if (error.code === "validation_error" && messages?.length) {
      return { fieldErrors: { password: messages.join(" ") } };
    }
    if (error.isForbidden) return { message: "Only Super Admins can change hospital passwords." };
    return { message: error.message };
  }
}

export async function setHospitalStatusAction(
  hospitalId: number,
  active: boolean,
): Promise<ActionResult> {
  try {
    const hospital = await withAdminToken((token) => setHospitalActive(token, hospitalId, active));
    revalidatePath(HOSPITALS_PATH);
    return {
      ok: true,
      message: `${hospital.name} is now ${active ? "active" : "inactive"}.`,
    };
  } catch (error) {
    if (error instanceof DjangoApiError) return { ok: false, message: error.message };
    throw error;
  }
}
