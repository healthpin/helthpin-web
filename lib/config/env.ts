/** Public API origin only. Backend secrets must never be added to this module. */
export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and restart the server.",
    );
  }
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.search || url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be an HTTP(S) origin without an API path or credentials.");
  }
  return url.origin;
}

/** Shared API configuration, also used by the proxy's token refresh. */
export const serverEnv = {
  /** Django API root including /api/v1, without a trailing slash. */
  get apiBaseUrl(): string {
    return `${getApiBaseUrl()}/api/v1`;
  },
  isProduction: process.env.NODE_ENV === "production",
} as const;
