import "server-only";

import { djangoFetch } from "@/lib/api/django";

import type { Partner } from "../types/partner";

/**
 * Partner (login) endpoints of one directory hospital:
 * /api/v1/hospitals/directory/{id}/account/. Super Admin only. Server-only.
 */

interface PartnerResponse {
  success: true;
  message: string;
  account: Partner;
}

const path = (directoryId: number, suffix = "") =>
  `/hospitals/directory/${directoryId}/account/${suffix}`;

export async function createPartner(
  accessToken: string,
  directoryId: number,
  input: { email: string; password: string; category: string },
): Promise<Partner> {
  const data = await djangoFetch<PartnerResponse>(path(directoryId), {
    method: "POST",
    body: input,
    accessToken,
  });
  return data.account;
}

export async function updatePartner(
  accessToken: string,
  directoryId: number,
  input: { email?: string; category?: string; password?: string },
): Promise<Partner> {
  const data = await djangoFetch<PartnerResponse>(path(directoryId), {
    method: "PATCH",
    body: input,
    accessToken,
  });
  return data.account;
}

export async function setPartnerActive(
  accessToken: string,
  directoryId: number,
  active: boolean,
): Promise<Partner> {
  const data = await djangoFetch<PartnerResponse>(
    path(directoryId, active ? "activate/" : "deactivate/"),
    { method: "POST", accessToken },
  );
  return data.account;
}
