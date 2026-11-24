import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { DjangoApiError } from "@/lib/api/django";
import { getHospitalSession, requireHospital } from "@/lib/auth/session";
import type { CurrentHospital } from "@/features/hospital-portal/types/hospitalPortal";

import { getHospitalSubscription } from "../api/subscriptionApi";
import type { HospitalSubscriptionState } from "../types/subscription";

/** Where a hospital without access is sent. Never guarded, so no redirect loop. */
export const SUBSCRIPTION_PATH = "/hospital/subscription";

/**
 * The signed-in hospital's subscription state, fetched once per request and
 * shared by the layout (navbar, sidebar) and the page. null when Django could
 * not answer; callers then show no reminder, and Django's own gate still
 * protects every restricted API.
 */
export const getHospitalSubscriptionState = cache(async (): Promise<HospitalSubscriptionState | null> => {
  const session = await getHospitalSession();
  if (session.status !== "authenticated") return null;
  try {
    return await getHospitalSubscription(session.accessToken);
  } catch (error) {
    if (error instanceof DjangoApiError && !error.isUnauthorized) return null;
    throw error;
  }
});

/**
 * For every hospital page except Subscription (and its receipts) and
 * Settings: without a current free trial or paid period, go to the
 * Subscription page. Pages run on every navigation, refresh and direct URL
 * visit, so this cannot be skipped by client-side routing. `has_access` is
 * computed by Django from stored dates; this is only routing, Django's
 * HasActiveSubscription permission is the real check on the data.
 */
export async function requireSubscribedHospital(): Promise<CurrentHospital> {
  const hospital = await requireHospital();
  const state = await getHospitalSubscriptionState();
  if (state && !state.subscription.has_access) redirect(SUBSCRIPTION_PATH);
  return hospital;
}
