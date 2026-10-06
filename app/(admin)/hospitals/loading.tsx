import { Card } from "@/components/ui/Card";

export default function HospitalsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading hospitals">
      <div className="mb-6 flex items-end justify-between">
        <div className="h-8 w-36 animate-pulse rounded bg-line/60" />
        <div className="h-10 w-36 animate-pulse rounded-lg bg-line/60" />
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-line p-4">
          <div className="h-10 w-full max-w-sm animate-pulse rounded-lg bg-canvas" />
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-6 px-5 py-4">
              <div className="h-4 w-48 rounded bg-canvas" />
              <div className="hidden h-4 w-56 rounded bg-canvas md:block" />
              <div className="ml-auto h-6 w-20 rounded-full bg-canvas" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
