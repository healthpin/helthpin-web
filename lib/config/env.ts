import "server-only";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and restart the server.`,
    );
  }
  return value;
}

/** Server-side configuration. Never import this from a Client Component. */
export const serverEnv = {
  /** Django API root including /api/v1, without a trailing slash. */
  get apiBaseUrl(): string {
    return required("API_BASE_URL").replace(/\/+$/, "");
  },
  isProduction: process.env.NODE_ENV === "production",
} as const;
