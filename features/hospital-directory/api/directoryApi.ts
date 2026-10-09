import "server-only";

import { djangoFetch } from "@/lib/api/django";
import type { Partner } from "@/features/partners/types/partner";

import type {
  DirectoryFilterOptions,
  DirectoryHospital,
  DirectoryHospitalInput,
  DirectoryPage,
  DirectoryQuery,
} from "../types/directory";

/** Hospital directory endpoints (/api/v1/hospitals/directory/). Server-only. */

export function listDirectory(accessToken: string, query: DirectoryQuery): Promise<DirectoryPage> {
  const params = new URLSearchParams();
  for (const key of ["search", "location", "state", "district", "hospital_category"] as const) {
    const value = query[key]?.trim();
    if (value) params.set(key, value);
  }
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return djangoFetch<DirectoryPage>(`/hospitals/directory/${qs ? `?${qs}` : ""}`, { accessToken });
}

/** One directory hospital, plus its partner login if the Super Admin has made it a partner. */
export async function getDirectoryHospital(
  accessToken: string,
  id: number,
): Promise<{ hospital: DirectoryHospital; partner: Partner | null }> {
  const data = await djangoFetch<{
    success: true;
    hospital: DirectoryHospital;
    account?: Partner | null;
  }>(`/hospitals/directory/${id}/`, { accessToken });
  return { hospital: data.hospital, partner: data.account ?? null };
}

export async function updateDirectoryHospital(
  accessToken: string,
  id: number,
  input: DirectoryHospitalInput,
): Promise<DirectoryHospital> {
  const data = await djangoFetch<{ success: true; hospital: DirectoryHospital }>(
    `/hospitals/directory/${id}/`,
    { method: "PATCH", body: input, accessToken },
  );
  return data.hospital;
}

export async function getDirectoryFilters(
  accessToken: string,
  state?: string,
): Promise<DirectoryFilterOptions> {
  const qs = state ? `?${new URLSearchParams({ state })}` : "";
  const data = await djangoFetch<DirectoryFilterOptions & { success: true }>(
    `/hospitals/directory/filters/${qs}`,
    { accessToken },
  );
  return { states: data.states, categories: data.categories, districts: data.districts };
}
