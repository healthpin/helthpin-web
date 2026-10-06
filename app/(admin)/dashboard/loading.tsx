import { StatCardSkeleton } from "@/features/dashboard/components/StatCard";
import { StatGrid } from "@/features/dashboard/components/StatGrid";

export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-line/60" />
      <StatGrid>
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </StatGrid>
    </div>
  );
}
