"use server";
import { revalidatePath } from "next/cache";
import { DjangoApiError } from "@/lib/api/django";
import { withAdminToken } from "@/lib/auth/adminRequest";
import { reviewRegistration } from "../api/registrationApi";
export async function reviewRegistrationAction(id: number, action: "approve" | "reject", reason?: string) {
  if (action === "reject" && !reason?.trim()) return { error: "A rejection reason is required." };
  try { await withAdminToken((token) => reviewRegistration(token, id, action, reason)); revalidatePath("/hospital-registrations"); return { ok: true }; }
  catch (error) { return { error: error instanceof DjangoApiError ? error.message : "Unable to update this registration." }; }
}
