"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertIcon } from "@/components/ui/icons";

/** Shown when a signed-in page fails, e.g. the Django API is down. */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
          <AlertIcon />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          We couldn&apos;t load this page. Check that the Health Pin API is running, then
          try again.
        </p>
        <div className="mt-6 flex justify-center">
          <Button onClick={reset}>Try again</Button>
        </div>
      </Card>
    </main>
  );
}
