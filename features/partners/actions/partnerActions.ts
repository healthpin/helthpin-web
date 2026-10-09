"use server";

import { revalidatePath } from "next/cache";

import { DjangoApiError } from "@/lib/api/django";
import { withAdminToken } from "@/lib/auth/adminRequest";

import { createPartner, setPartnerActive, updatePartner } from "../api/partnersApi";
import type {
  ActionResult,
  PartnerField,
  PartnerFieldErrors,
  PartnerFormState,
  PasswordFormState,
} from "../types/partner";
import {
  hasFieldErrors,
  normalizePartnerInput,
  validatePartnerInput,
  validatePasswordChange,
} from "../validation";

const detailPath = (directoryId: number) => `/dashboard/hospital-directory/${directoryId}`;

function readForm(formData: FormData) {
  return normalizePartnerInput({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    category: String(formData.get("category") ?? ""),
  });
}

/** Django error -> form state (field errors for 400s, a banner otherwise). */
function toFormState(error: unknown, values: { email: string; category: string }): PartnerFormState {
  if (!(error instanceof DjangoApiError)) throw error;
  if (error.code === "validation_error" && error.fieldErrors) {
    const fieldErrors: PartnerFieldErrors = {};
    for (const field of ["email", "password", "category"] as PartnerField[]) {
      const messages = error.fieldErrors[field];
      if (messages?.length) fieldErrors[field] = messages.join(" ");
    }
    if (hasFieldErrors(fieldErrors)) return { fieldErrors, values };
  }
  if (error.isForbidden) return { message: "Only Super Admins can manage partners.", values };
  return { message: error.message, values };
}

export async function makePartnerAction(
  directoryId: number,
  _previous: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const input = readForm(formData);
  const values = { email: input.email, category: input.category };

  const fieldErrors = validatePartnerInput(input, { requirePassword: true });
  if (hasFieldErrors(fieldErrors)) return { fieldErrors, values };

  try {
    await withAdminToken((token) => createPartner(token, directoryId, input));
    revalidatePath(detailPath(directoryId));
    return { successAt: Date.now(), successMessage: "Partner created. They can now sign in." };
  } catch (error) {
    return toFormState(error, values);
  }
}

export async function updatePartnerAction(
  directoryId: number,
  _previous: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const input = readForm(formData);
  const values = { email: input.email, category: input.category };

  const fieldErrors = validatePartnerInput(input, { requirePassword: false });
  if (hasFieldErrors(fieldErrors)) return { fieldErrors, values };

  try {
    await withAdminToken((token) =>
      updatePartner(token, directoryId, { email: input.email, category: input.category }),
    );
    revalidatePath(detailPath(directoryId));
    return { successAt: Date.now(), successMessage: "Partner updated." };
  } catch (error) {
    return toFormState(error, values);
  }
}

/** Set a new password for a partner. The password is never echoed back. */
export async function changePartnerPasswordAction(
  directoryId: number,
  _previous: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fieldErrors = validatePasswordChange(password, confirm);
  if (fieldErrors.password || fieldErrors.confirm) return { fieldErrors };

  try {
    await withAdminToken((token) => updatePartner(token, directoryId, { password }));
    return {
      successAt: Date.now(),
      successMessage: "Password updated. The partner has been signed out everywhere.",
    };
  } catch (error) {
    if (!(error instanceof DjangoApiError)) throw error;
    const messages = error.fieldErrors?.password;
    if (error.code === "validation_error" && messages?.length) {
      return { fieldErrors: { password: messages.join(" ") } };
    }
    if (error.isForbidden) return { message: "Only Super Admins can change partner passwords." };
    return { message: error.message };
  }
}

export async function setPartnerStatusAction(
  directoryId: number,
  active: boolean,
): Promise<ActionResult> {
  try {
    await withAdminToken((token) => setPartnerActive(token, directoryId, active));
    revalidatePath(detailPath(directoryId));
    return { ok: true, message: `Partner is now ${active ? "active" : "inactive"}.` };
  } catch (error) {
    if (error instanceof DjangoApiError) return { ok: false, message: error.message };
    throw error;
  }
}
