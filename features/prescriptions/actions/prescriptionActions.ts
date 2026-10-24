"use server";

import { revalidatePath } from "next/cache";

import { DjangoApiError } from "@/lib/api/django";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";

import { removePrescription } from "../api/prescriptionsApi";

export async function removePrescriptionAction(id: string): Promise<{ ok: boolean; message: string }> {
  try {
    await withHospitalToken((token) => removePrescription(token, id));
    revalidatePath("/hospital/bookings");
    return { ok: true, message: "Prescription removed." };
  } catch (error) {
    if (error instanceof DjangoApiError) return { ok: false, message: error.message };
    throw error;
  }
}
