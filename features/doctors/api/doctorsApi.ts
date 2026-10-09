import "server-only";

import { djangoFetch } from "@/lib/api/django";

import type { Doctor, DoctorListQuery, DoctorPage, DoctorPayload } from "../types/doctor";

/** The signed-in hospital's doctors (/api/v1/hospital/doctors/). Server-only. */

interface DoctorResponse {
  success: true;
  message: string;
  doctor: Doctor;
}

export function listDoctors(accessToken: string, query: DoctorListQuery): Promise<DoctorPage> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return djangoFetch<DoctorPage>(`/hospital/doctors/${qs ? `?${qs}` : ""}`, { accessToken });
}

export async function createDoctor(accessToken: string, input: DoctorPayload): Promise<Doctor> {
  const data = await djangoFetch<DoctorResponse>("/hospital/doctors/", {
    method: "POST",
    body: input,
    accessToken,
  });
  return data.doctor;
}

export async function updateDoctor(
  accessToken: string,
  id: number,
  input: Partial<DoctorPayload>,
): Promise<Doctor> {
  const data = await djangoFetch<DoctorResponse>(`/hospital/doctors/${id}/`, {
    method: "PATCH",
    body: input,
    accessToken,
  });
  return data.doctor;
}
