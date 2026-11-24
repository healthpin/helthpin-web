"use server";

import { revalidatePath } from "next/cache";

import { djangoFetch, DjangoApiError } from "@/lib/api/django";
import { withHospitalToken } from "@/lib/auth/hospitalRequest";

import type { CheckoutOptions, Payment } from "../types/subscription";

/**
 * Every call runs as the signed-in hospital and Django scopes it to that
 * hospital. Razorpay secrets never pass through here: Django creates the
 * order and verifies the payment signature.
 */
type Result<T = object> = ({ ok: true; message: string } & T) | { ok: false; error: string };

const PATH = "/hospital/subscription";

function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof DjangoApiError) return { ok: false, error: error.message };
  throw error;
}

function positiveId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function startTrialAction(plan: number): Promise<Result> {
  const id = positiveId(plan);
  if (!id) return { ok: false, error: "Choose a plan." };
  try {
    const data = await withHospitalToken((accessToken) =>
      djangoFetch<{ message: string }>(`${PATH}/trial/`, { method: "POST", body: { plan_id: id }, accessToken }),
    );
    revalidatePath("/hospital", "layout");
    return { ok: true, message: data.message };
  } catch (error) {
    return failure(error);
  }
}

export async function createOrderAction(plan: number): Promise<Result<{ checkout: CheckoutOptions }>> {
  const id = positiveId(plan);
  if (!id) return { ok: false, error: "Choose a plan." };
  try {
    const data = await withHospitalToken((accessToken) =>
      djangoFetch<{ message: string; checkout: CheckoutOptions }>(`${PATH}/orders/`, { method: "POST", body: { plan_id: id }, accessToken }),
    );
    return { ok: true, message: data.message, checkout: data.checkout };
  } catch (error) {
    return failure(error);
  }
}

export interface CheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function verifyPaymentAction(response: CheckoutResponse): Promise<Result<{ payment: Payment }>> {
  const body = {
    razorpay_order_id: String(response?.razorpay_order_id ?? "").slice(0, 64),
    razorpay_payment_id: String(response?.razorpay_payment_id ?? "").slice(0, 64),
    razorpay_signature: String(response?.razorpay_signature ?? "").slice(0, 128),
  };
  try {
    const data = await withHospitalToken((accessToken) =>
      djangoFetch<{ message: string; payment: Payment }>(`${PATH}/payments/verify/`, { method: "POST", body, accessToken }),
    );
    revalidatePath("/hospital", "layout");
    return { ok: true, message: data.message, payment: data.payment };
  } catch (error) {
    return failure(error);
  }
}

/** Checkout said the payment failed. Informational only: it never grants access. */
export async function reportFailureAction(orderId: string, reason: string): Promise<void> {
  try {
    await withHospitalToken((accessToken) =>
      djangoFetch(`${PATH}/payments/failed/`, {
        method: "POST",
        body: { razorpay_order_id: String(orderId).slice(0, 64), reason: String(reason ?? "").slice(0, 500) },
        accessToken,
      }),
    );
    revalidatePath("/hospital", "layout");
  } catch (error) {
    if (!(error instanceof DjangoApiError)) throw error;
  }
}

export async function refreshPaymentAction(paymentId: number): Promise<Result<{ payment: Payment }>> {
  const id = positiveId(paymentId);
  if (!id) return { ok: false, error: "Payment not found." };
  try {
    const data = await withHospitalToken((accessToken) =>
      djangoFetch<{ message: string; payment: Payment }>(`${PATH}/payments/${id}/refresh/`, { method: "POST", accessToken }),
    );
    revalidatePath("/hospital", "layout");
    return { ok: true, message: data.message, payment: data.payment };
  } catch (error) {
    return failure(error);
  }
}
