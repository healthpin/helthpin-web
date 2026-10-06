import "server-only";

import { serverEnv } from "@/lib/config/env";

/**
 * Server-side client for the Django REST API. Only the Next.js server calls
 * Django; the browser talks to this app. Every Django error response has the
 * shape {"success": false, "code", "message", "errors"?}.
 */

export class DjangoApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    options: { status: number; code: string; fieldErrors?: Record<string, string[]> },
  ) {
    super(message);
    this.name = "DjangoApiError";
    this.status = options.status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNetworkError(): boolean {
    return this.code === "network_error";
  }
}

interface DjangoErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface DjangoRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  accessToken?: string;
  /** The browser's IP, so Django's per-IP rate limits see the real client. */
  clientIp?: string | null;
}

const TIMEOUT_MS = 15_000;

export async function djangoFetch<T>(path: string, options: DjangoRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
  if (options.clientIp) headers["X-Forwarded-For"] = options.clientIp;

  let response: Response;
  try {
    response = await fetch(`${serverEnv.apiBaseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new DjangoApiError("Can't reach the Health Pin API. Please try again shortly.", {
      status: 0,
      code: "network_error",
    });
  }

  const data: unknown = await response.json().catch(() => null);
  if (response.ok) return data as T;

  const body = (data ?? {}) as DjangoErrorBody;
  throw new DjangoApiError(body.message ?? "Something went wrong. Please try again.", {
    status: response.status,
    code: body.code ?? "error",
    fieldErrors: body.errors,
  });
}
