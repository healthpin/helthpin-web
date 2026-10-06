import "server-only";

import { djangoFetch } from "@/lib/api/django";

import type { Hospital, HospitalInput, HospitalListQuery, HospitalPage } from "../types/hospital";

/** Super Admin hospital endpoints (/api/v1/admin/hospitals/). Server-only. */

interface HospitalResponse {
  success: true;
  message: string;
  hospital: Hospital;
}

export function listHospitals(accessToken: string, query: HospitalListQuery): Promise<HospitalPage> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.status) params.set("status", query.status);
  const qs = params.toString();
  return djangoFetch<HospitalPage>(`/admin/hospitals/${qs ? `?${qs}` : ""}`, { accessToken });
}

export async function createHospital(accessToken: string, input: HospitalInput): Promise<Hospital> {
  const data = await djangoFetch<HospitalResponse>("/admin/hospitals/", {
    method: "POST",
    body: input,
    accessToken,
  });
  return data.hospital;
}

export async function updateHospital(
  accessToken: string,
  id: number,
  input: Pick<HospitalInput, "name" | "email">,
): Promise<Hospital> {
  const data = await djangoFetch<HospitalResponse>(`/admin/hospitals/${id}/`, {
    method: "PATCH",
    body: input,
    accessToken,
  });
  return data.hospital;
}

/** Separate endpoint from PATCH: the hospital is signed out everywhere. */
export async function setHospitalPassword(
  accessToken: string,
  id: number,
  password: string,
): Promise<Hospital> {
  const data = await djangoFetch<HospitalResponse>(`/admin/hospitals/${id}/password/`, {
    method: "POST",
    body: { password },
    accessToken,
  });
  return data.hospital;
}

export async function setHospitalActive(
  accessToken: string,
  id: number,
  active: boolean,
): Promise<Hospital> {
  const data = await djangoFetch<HospitalResponse>(
    `/admin/hospitals/${id}/${active ? "activate" : "deactivate"}/`,
    { method: "POST", accessToken },
  );
  return data.hospital;
}
