import type { SessionTokens } from "./cookies";

/**
 * Swaps a refresh token for a new pair (Simple JWT rotation, shared with the
 * mobile app). Kept free of `server-only` imports because proxy.ts uses it.
 * Throws if Django rejects the token or can't be reached.
 */
export async function refreshSessionTokens(refreshToken: string): Promise<SessionTokens> {
  const baseUrl = process.env.API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) throw new Error("API_BASE_URL is not set.");

  const response = await fetch(`${baseUrl}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Token refresh failed (${response.status}).`);

  const data = (await response.json()) as Partial<SessionTokens>;
  if (!data.access || !data.refresh) throw new Error("Token refresh returned no tokens.");
  return { access: data.access, refresh: data.refresh };
}
