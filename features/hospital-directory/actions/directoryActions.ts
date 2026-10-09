"use server";

import { revalidatePath } from "next/cache";

import { DjangoApiError } from "@/lib/api/django";
import { withAdminToken } from "@/lib/auth/adminRequest";

import { updateDirectoryHospital } from "../api/directoryApi";
import { DIRECTORY_FIELDS } from "../fields";
import type { DirectoryHospitalInput } from "../types/directory";

export interface EditHospitalState {
  successAt?: number;
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
}

export async function updateDirectoryHospitalAction(
  hospitalId: number,
  _previous: EditHospitalState,
  formData: FormData,
): Promise<EditHospitalState> {
  const input: Record<string, string> = {};
  for (const { name } of DIRECTORY_FIELDS) input[name] = String(formData.get(name) ?? "").trim();

  if (input.hospital_name.length < 2) {
    return { fieldErrors: { hospital_name: "Enter the hospital name." } };
  }

  try {
    await withAdminToken((token) =>
      updateDirectoryHospital(token, hospitalId, input as DirectoryHospitalInput),
    );
    revalidatePath(`/dashboard/hospital-directory/${hospitalId}`);
    revalidatePath("/dashboard/hospital-directory");
    return { successAt: Date.now() };
  } catch (error) {
    if (!(error instanceof DjangoApiError)) throw error;
    if (error.code === "validation_error" && error.fieldErrors) {
      const fieldErrors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(error.fieldErrors)) {
        if (messages?.length) fieldErrors[field] = messages.join(" ");
      }
      if (Object.keys(fieldErrors).length) return { fieldErrors };
    }
    if (error.isForbidden) return { message: "Only Super Admins can edit hospitals." };
    return { message: error.message };
  }
}
