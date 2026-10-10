"use client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
export default function HospitalError({ reset }: { reset: () => void }) {
  return <Card className="mx-auto max-w-lg p-8 text-center"><h2 className="text-lg font-semibold">We couldn&apos;t load your hospital data</h2><p className="mt-2 text-sm text-muted">Check your connection and make sure the Health Pin API is running, then try again.</p><Button className="mt-5" onClick={reset}>Try again</Button></Card>;
}
