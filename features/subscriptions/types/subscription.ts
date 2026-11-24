export type SubscriptionStatus = "TRIAL_ACTIVE" | "ACTIVE" | "EXPIRED" | "PAYMENT_PENDING" | "PAYMENT_FAILED" | "CANCELLED";
export type PaymentStatus = "CREATED" | "PENDING" | "PAID" | "FAILED";
export type GatewayMode = "test" | "live";

/** Money arrives from Django as a decimal string, e.g. "1499.00". */
export interface Plan {
  id: number;
  name: string;
  duration_months: number;
  trial_months: number;
  original_price: string;
  offer_price: string;
  discount_percent: number;
  description: string;
}

export interface AdminPlan extends Plan {
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionSummary {
  status: SubscriptionStatus | null;
  status_label: string;
  has_access: boolean;
  /** Hospital-level: true only before the hospital's first-ever activation. */
  trial_available: boolean;
  /** When the hospital's one-time free trial was used (or forfeited by paying first). */
  trial_used_at: string | null;
  plan: { id: number; name: string; duration_months: number } | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  access_ends_at: string | null;
  remaining_days: number;
  trial_remaining_days: number;
  cancelled_at: string | null;
  cancellation_reason: string;
  /** Paid time that has not run out yet (e.g. paid during the trial). */
  paid_ahead: boolean;
  /** When a payment made now would start. */
  next_payment_starts_at: string;
  /** Navbar reminder, computed by the backend; null without a subscription. */
  payment_reminder: PaymentReminder | null;
}

export type ReminderState = "upcoming" | "due_soon" | "due_today" | "overdue" | "confirming" | "expired" | "cancelled";

export interface PaymentReminder {
  state: ReminderState;
  /** trial_ends: the trial ends with no paid period after it; renewal: paid coverage ends. */
  reason: "trial_ends" | "trial_ended" | "renewal" | null;
  due_at: string | null;
  /** The due date on the hospital's calendar (YYYY-MM-DD, Asia/Kolkata). */
  due_date: string | null;
  /** Calendar days from today to the due date; negative when past. */
  days_until_due: number | null;
  /** 7, 3, 1 or 0 while a reminder notification applies, else null. */
  notify_stage: 0 | 1 | 3 | 7 | null;
  trial_ends_at: string | null;
  plan_name: string;
  amount_payable: string | null;
  cancelled_at: string | null;
}

export interface Payment {
  id: number;
  receipt_number: string;
  plan_name: string;
  duration_months: number;
  original_price: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  status_label: string;
  mode: GatewayMode;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  method: string;
  failure_reason: string;
  /** Paid period bought by this payment. */
  period_start: string | null;
  period_end: string | null;
  /** Free trial included with a first activation paid directly (0 otherwise). */
  trial_months: number;
  trial_start: string | null;
  trial_end: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface AdminPayment extends Payment {
  hospital_id: number;
  hospital_name: string;
}

export interface HospitalSubscriptionState {
  subscription: SubscriptionSummary;
  plans: Plan[];
  payments_enabled: boolean;
  payment_mode: GatewayMode | null;
  pending_payment: Payment | null;
}

export interface Receipt extends Payment {
  billed_to: { name: string; email: string; address: string };
  issuer: { name: string };
}

export interface CheckoutOptions {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  receipt_number: string;
  prefill: { name: string; email: string };
}

export interface AdminSubscriptionRow extends SubscriptionSummary {
  hospital_id: number;
  hospital_name: string;
  hospital_email: string;
  hospital_active: boolean;
  subscription_id: number | null;
  last_payment: Payment | null;
}

export interface Page<T> {
  success: true;
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}

export type AdminSubscriptionPage = Page<AdminSubscriptionRow> & { summary: Record<SubscriptionStatus | "NONE", number> };

export interface FormState {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}
