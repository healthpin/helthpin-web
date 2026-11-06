import "server-only";
import { djangoFetch } from "@/lib/api/django";
import type { HospitalRegistration, RegistrationPage } from "../types/registration";

export function listRegistrations(token: string, query: { search?: string; status?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (query.search) qs.set("search", query.search);
  if (query.status) qs.set("status", query.status);
  if (query.page && query.page > 1) qs.set("page", String(query.page));
  const suffix = qs.toString() ? `?${qs}` : "";
  return djangoFetch<RegistrationPage>(`/admin/hospital-registrations/${suffix}`, { accessToken: token });
}
export async function getRegistration(token: string, id: number) { const data = await djangoFetch<{ registration: HospitalRegistration }>(`/admin/hospital-registrations/${id}/`, { accessToken: token }); return data.registration; }
export async function reviewRegistration(token: string, id: number, action: "approve" | "reject", reason?: string) {
  const data = await djangoFetch<{ registration: HospitalRegistration }>(`/admin/hospital-registrations/${id}/${action}/`, { method: "POST", body: action === "reject" ? { reason } : {}, accessToken: token });
  return data.registration;
}
