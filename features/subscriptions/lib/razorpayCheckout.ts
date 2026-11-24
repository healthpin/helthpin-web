import type { CheckoutResponse } from "../actions/hospitalSubscriptionActions";
import type { CheckoutOptions } from "../types/subscription";

/**
 * Loads Razorpay Checkout (https://checkout.razorpay.com/v1/checkout.js) on
 * demand and opens it for an order Django created. The browser only ever sees
 * the public Key ID and the order id.
 */
const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayFailure {
  error?: { description?: string; reason?: string; metadata?: { order_id?: string } };
}

interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", handler: (response: RazorpayFailure) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(new Error("Could not load Razorpay Checkout. Check your connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return loading;
}

export type CheckoutOutcome =
  | { kind: "paid"; response: CheckoutResponse }
  | { kind: "failed"; reason: string }
  | { kind: "dismissed" };

/**
 * Resolves once: with the signed response on success, or when the hospital
 * closes Checkout. A failed attempt is reported through onFailure; Checkout
 * stays open so the hospital can retry with another method.
 */
export async function openCheckout(
  options: CheckoutOptions,
  onFailure: (reason: string) => void,
): Promise<CheckoutOutcome> {
  await loadScript();
  if (!window.Razorpay) throw new Error("Razorpay Checkout is unavailable.");
  const Razorpay = window.Razorpay;
  return new Promise<CheckoutOutcome>((resolve) => {
    let failedReason = "";
    const checkout = new Razorpay({
      key: options.key_id,
      order_id: options.order_id,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      notes: { receipt_number: options.receipt_number },
      theme: { color: "#8a1044" },
      handler: (response: CheckoutResponse) => resolve({ kind: "paid", response }),
      modal: {
        confirm_close: true,
        ondismiss: () => resolve(failedReason ? { kind: "failed", reason: failedReason } : { kind: "dismissed" }),
      },
    });
    checkout.on("payment.failed", (response) => {
      failedReason = response.error?.description || "The payment did not go through.";
      onFailure(failedReason);
    });
    checkout.open();
  });
}
