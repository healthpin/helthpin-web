"use server";
import { revalidatePath } from "next/cache";
import { DjangoApiError } from "@/lib/api/django";
import { withAdminToken } from "@/lib/auth/adminRequest";
import { approveAllRegistrations, reviewRegistration, type ApproveAllResponse } from "../api/registrationApi";
export async function reviewRegistrationAction(id: number, action: "approve" | "reject", reason?: string) {
  if (action === "reject" && !reason?.trim()) return { error: "A rejection reason is required." };
  try { await withAdminToken((token) => reviewRegistration(token, id, action, reason)); revalidatePath("/hospital-registrations"); return { ok: true }; }
  catch (error) { return { error: error instanceof DjangoApiError ? error.message : "Unable to update this registration." }; }
}

export type ApproveAllResult =
  | { ok: true; message: string; approved: number; skipped: ApproveAllResponse["skipped"] }
  | { ok: false; message: string; code?: string };

export async function approveAllRegistrationsAction(expectedCount: number): Promise<ApproveAllResult> {
  const count = Math.trunc(Number(expectedCount));
  if (!(count > 0)) return { ok: false, message: "There are no pending registrations to approve." };
  try {
    const result = await withAdminToken((token) => approveAllRegistrations(token, count));
    revalidatePath("/hospital-registrations");
    return { ok: true, message: result.message, approved: result.approved, skipped: result.skipped };
  } catch (error) {
    if (error instanceof DjangoApiError) return { ok: false, message: error.message, code: error.code };
    return { ok: false, message: "Unable to approve the registrations right now." };
  }
}
