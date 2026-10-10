import { Button } from "@/components/ui/Button";
export function LiveIndicator({ stale, refreshing, updatedAt, refresh }: {
  stale: boolean; refreshing: boolean; updatedAt: string | null; refresh: () => void;
}) {
  return <div className="flex flex-wrap items-center gap-3">
    <span className="flex items-center gap-2 text-xs text-muted" aria-live="polite">
      <span className={`size-2 rounded-full ${stale ? "bg-warning" : "bg-success"}`} />
      {stale ? "Connection interrupted - showing last update" : `Live | ${updatedAt ? `updated ${updatedAt}` : "refreshes every 15 seconds"}`}
    </span>
    <Button size="sm" variant="secondary" onClick={refresh} isLoading={refreshing}>Refresh</Button>
  </div>;
}
