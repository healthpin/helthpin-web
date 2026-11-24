"use server";

import { revalidatePath } from "next/cache";

import { djangoFetch, DjangoApiError } from "@/lib/api/django";
import { withAdminToken } from "@/lib/auth/adminRequest";

import type { FormState } from "../types/subscription";

/** Django's IsSuperAdmin authorizes every call; checks here are only for quick feedback. */
function errorState(error: unknown): FormState {
  if (!(error instanceof DjangoApiError)) throw error;
  return {
    ok: false,
    message: error.message,
    fieldErrors: Object.fromEntries(
      Object.entries(error.fieldErrors ?? {}).map(([key, value]) => [key, ([] as string[]).concat(value).join(" ")]),
    ),
  };
}

const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();

export async function savePlanAction(_previous: FormState, data: FormData): Promise<FormState> {
  const id = Number(text(data, "id")) || null;
  const body = {
    name: text(data, "name"),
    duration_months: Number(text(data, "duration_months")),
    trial_months: Number(text(data, "trial_months")),
    original_price: text(data, "original_price"),
    offer_price: text(data, "offer_price"),
    description: text(data, "description"),
    sort_order: Number(text(data, "sort_order")) || 0,
    is_active: data.get("is_active") === "on",
  };
  const fieldErrors: Record<string, string> = {};
  if (!body.name) fieldErrors.name = "Enter a plan name.";
  if (!Number.isInteger(body.duration_months) || body.duration_months < 1) fieldErrors.duration_months = "Enter at least 1 month.";
  if (!Number.isInteger(body.trial_months) || body.trial_months < 0) fieldErrors.trial_months = "Enter 0 or more months.";
  if (!(Number(body.original_price) >= 1)) fieldErrors.original_price = "Enter a price of at least ₹1.";
  if (!(Number(body.offer_price) >= 1)) fieldErrors.offer_price = "Enter a price of at least ₹1.";
  else if (Number(body.offer_price) > Number(body.original_price)) fieldErrors.offer_price = "Offer price cannot be more than the original price.";
  if (Object.keys(fieldErrors).length) return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  try {
    await withAdminToken((accessToken) =>
      djangoFetch(id ? `/admin/subscription-plans/${id}/` : "/admin/subscription-plans/", { method: id ? "PATCH" : "POST", body, accessToken }),
    );
    revalidatePath("/subscriptions");
    return { ok: true, message: id ? "Plan updated." : "Plan created." };
  } catch (error) {
    return errorState(error);
  }
}

export async function setPlanActiveAction(id: number, isActive: boolean): Promise<FormState> {
  try {
    await withAdminToken((accessToken) =>
      djangoFetch(`/admin/subscription-plans/${Number(id)}/`, { method: "PATCH", body: { is_active: Boolean(isActive) }, accessToken }),
    );
    revalidatePath("/subscriptions");
    return { ok: true, message: isActive ? "Plan activated." : "Plan deactivated." };
  } catch (error) {
    return errorState(error);
  }
}

export async function subscriptionAction(id: number, action: "cancel" | "reinstate", reason = ""): Promise<FormState> {
  if (action !== "cancel" && action !== "reinstate") return { ok: false, message: "Unknown action." };
  try {
    await withAdminToken((accessToken) =>
      djangoFetch(`/admin/subscriptions/${Number(id)}/${action}/`, { method: "POST", body: { reason: String(reason).slice(0, 500) }, accessToken }),
    );
    revalidatePath("/subscriptions");
    return { ok: true, message: action === "cancel" ? "Subscription cancelled." : "Subscription reinstated." };
  } catch (error) {
    return errorState(error);
  }
}
