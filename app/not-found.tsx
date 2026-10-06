import Link from "next/link";

import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="text-sm font-semibold text-brand">404</p>
        <h1 className="mt-1 text-xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-muted">This page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Back to dashboard
        </Link>
      </Card>
    </main>
  );
}
