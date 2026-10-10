import "server-only";

import { djangoFetch } from "@/lib/api/django";

import type { CurrentHospital } from "../types/hospitalPortal";

/** GET /hospital/auth/me/: Django's IsHospital permission decides. */
export async function fetchCurrentHospital(accessToken: string): Promise<CurrentHospital> {
  const data = await djangoFetch<{ success: true; hospital: CurrentHospital }>(
    "/hospital/auth/me/",
    { accessToken },
  );
  return data.hospital;
}

export function getHospitalDashboard(accessToken: string) {
  return djangoFetch<import("../types/hospitalPortal").HospitalDashboard>("/hospital/dashboard/", { accessToken });
}
export async function getHospitalProfile(accessToken: string) {
  const result = await djangoFetch<{ profile: import("../types/hospitalPortal").HospitalProfile }>("/hospital/profile/", { accessToken });
  return result.profile;
}
