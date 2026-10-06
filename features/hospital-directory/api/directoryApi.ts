import "server-only";

import { djangoFetch } from "@/lib/api/django";

import type {
  DirectoryFilterOptions,
  DirectoryHospital,
  DirectoryPage,
  DirectoryQuery,
} from "../types/directory";

/** Read-only hospital directory endpoints (/api/v1/hospitals/directory/). Server-only. */

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

export async function getDirectoryHospital(
  accessToken: string,
  id: number,
): Promise<DirectoryHospital> {
  const data = await djangoFetch<{ success: true; hospital: DirectoryHospital }>(
    `/hospitals/directory/${id}/`,
    { accessToken },
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
