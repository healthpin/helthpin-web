import type { ComponentType } from "react";

import { Card } from "@/components/ui/Card";
import {
  CalendarIcon,
  PrescriptionIcon,
  StethoscopeIcon,
  UsersIcon,
  type IconProps,
} from "@/components/ui/icons";

import type { DashboardStat, StatIcon } from "../types/stats";

const icons: Record<StatIcon, ComponentType<IconProps>> = {
  users: UsersIcon,
  doctors: StethoscopeIcon,
  appointments: CalendarIcon,
  prescriptions: PrescriptionIcon,
};

const numberFormat = new Intl.NumberFormat("en-IN");

/** One headline number. Reusable for any future metric. */
export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = icons[stat.icon];
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{stat.label}</p>
        <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon />
        </span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-ink">
        {numberFormat.format(stat.value)}
      </p>
      {stat.trend && <p className="text-xs font-medium text-success">{stat.trend}</p>}
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="flex animate-pulse flex-col gap-4 p-5" aria-hidden="true">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-canvas" />
        <div className="size-10 rounded-xl bg-canvas" />
      </div>
      <div className="h-8 w-24 rounded bg-canvas" />
      <div className="h-3 w-32 rounded bg-canvas" />
    </Card>
  );
}
