import "server-only";

import type { DashboardStats } from "../types/stats";
import { mockDashboardStats } from "./mockDashboardStats";

/**
 * The single place the dashboard gets its numbers.
 *
 * TODO(admin-stats): when Django has e.g. GET /api/v1/admin/stats/ (protected
 * by IsSuperAdmin), call it here with djangoFetch(path, { accessToken }) and
 * return { stats, isMock: false }. The page and cards need no changes.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return { stats: mockDashboardStats, isMock: true };
}
