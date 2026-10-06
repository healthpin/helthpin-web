import type { DashboardStat } from "../types/stats";

/**
 * PLACEHOLDER NUMBERS. There are no admin statistics APIs yet. Delete this
 * file once getDashboardStats() reads from Django.
 */
export const mockDashboardStats: DashboardStat[] = [
  { id: "users", label: "Total Users", value: 12_480, trend: "+8.2% this month", icon: "users" },
  { id: "doctors", label: "Total Doctors", value: 342, trend: "+12 this month", icon: "doctors" },
  {
    id: "appointments",
    label: "Total Appointments",
    value: 5_916,
    trend: "+4.1% this week",
    icon: "appointments",
  },
  {
    id: "prescriptions",
    label: "Total Prescriptions",
    value: 8_203,
    trend: "+6.7% this month",
    icon: "prescriptions",
  },
];
