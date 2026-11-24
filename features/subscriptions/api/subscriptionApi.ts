import "server-only";

import { djangoFetch } from "@/lib/api/django";

import type {
  AdminPayment,
  AdminPlan,
  AdminSubscriptionPage,
  HospitalSubscriptionState,
  Page,
  Payment,
  Receipt,
} from "../types/subscription";

function query(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || (key === "page" && Number(value) <= 1)) continue;
    qs.set(key, String(value));
  }
  return qs.toString() ? `?${qs}` : "";
}

// --- Hospital (Django scopes every call to the signed-in hospital) ----------

export function getHospitalSubscription(accessToken: string) {
  return djangoFetch<HospitalSubscriptionState & { success: true }>("/hospital/subscription/", { accessToken });
}

export function listHospitalPayments(accessToken: string, page = 1) {
  return djangoFetch<Page<Payment>>(`/hospital/subscription/payments/${query({ page })}`, { accessToken });
}

export async function getReceipt(accessToken: string, id: number) {
  const data = await djangoFetch<{ receipt: Receipt }>(`/hospital/subscription/payments/${id}/receipt/`, { accessToken });
  return data.receipt;
}

// --- Super Admin -----------------------------------------------------------------

export async function listPlans(accessToken: string) {
  const data = await djangoFetch<{ plans: AdminPlan[] }>("/admin/subscription-plans/", { accessToken });
  return data.plans;
}

export function listSubscriptions(accessToken: string, params: { status?: string; search?: string; page?: number }) {
  return djangoFetch<AdminSubscriptionPage>(`/admin/subscriptions/${query(params)}`, { accessToken });
}

export function listPayments(accessToken: string, params: { status?: string; page?: number }) {
  return djangoFetch<Page<AdminPayment>>(`/admin/subscription-payments/${query(params)}`, { accessToken });
}
