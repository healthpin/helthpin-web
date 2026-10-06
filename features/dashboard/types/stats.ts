export type StatIcon = "users" | "doctors" | "appointments" | "prescriptions";

export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  /** Short context line, e.g. "+12% this month". */
  trend?: string;
  icon: StatIcon;
}

export interface DashboardStats {
  stats: DashboardStat[];
  /** True while the numbers are placeholders; the page shows a "Demo data" badge. */
  isMock: boolean;
}
