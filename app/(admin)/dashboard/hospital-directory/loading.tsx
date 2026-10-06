import { Card } from "@/components/ui/Card";

export default function HospitalDirectoryLoading() {
  return (
    <div aria-busy="true" aria-label="Loading hospital directory">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-line/60" />
      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-canvas" />
          ))}
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-6 px-5 py-4">
              <div className="h-4 w-64 rounded bg-canvas" />
              <div className="hidden h-4 w-40 rounded bg-canvas md:block" />
              <div className="ml-auto h-4 w-24 rounded bg-canvas" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
