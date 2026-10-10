"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { djangoFetch, DjangoApiError } from "@/lib/api/django";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { getHospitalDashboard } from "../api/hospitalPortalApi";
import type { SettingsState } from "../types/hospitalPortal";

function errorState(error: unknown): SettingsState {
  if (!(error instanceof DjangoApiError)) throw error;
  return { message: error.message, fieldErrors: Object.fromEntries(Object.entries(error.fieldErrors ?? {}).map(([key, value]) => [key, value.join(" ")])) };
}
export async function fetchDashboardAction() {
  try { return await withHospitalToken(getHospitalDashboard); }
  catch (error) { if (error instanceof DjangoApiError) return null; throw error; }
}
export async function saveProfileAction(_previous: SettingsState, data: FormData): Promise<SettingsState> {
  const fields = ["name", "category", "email", "address", "telephone", "website", "state", "district", "pincode"];
  const body = Object.fromEntries(fields.map((field) => [field, String(data.get(field) ?? "").trim()]));
  try {
    await withHospitalToken((accessToken) => djangoFetch("/hospital/profile/", { method: "PATCH", body, accessToken }));
    revalidatePath("/hospital", "layout");
    return { success: true, message: "Your hospital profile has been saved." };
  } catch (error) { return errorState(error); }
}
export async function changePasswordAction(_previous: SettingsState, data: FormData): Promise<SettingsState> {
  const body = Object.fromEntries(["current_password", "new_password", "confirm_password"].map((field) => [field, String(data.get(field) ?? "")]));
  try {
    await withHospitalToken((accessToken) => djangoFetch("/hospital/password/", { method: "POST", body, accessToken }));
  } catch (error) { return errorState(error); }
  const store = await cookies();
  store.delete(ACCESS_COOKIE); store.delete(REFRESH_COOKIE);
  redirect("/login?passwordChanged=1");
}
