import Link from "next/link";

import { LogoutButton } from "@/components/header/LogoutButton";
import { Card } from "@/components/ui/Card";
import { LockIcon } from "@/components/ui/icons";

/**
 * Shown when Django answers 403: signed in, but this account type can't use
 * this area (e.g. a hospital on a Super Admin page, or a role that changed).
 */
export function AccessDenied({ homeHref }: { homeHref?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
          <LockIcon />
        </div>
        <p className="mt-4 text-sm font-semibold text-danger">403 · Access denied</p>
        <h1 className="mt-1 text-xl font-bold text-ink">You can&apos;t open this page</h1>
        <p className="mt-2 text-sm text-muted">
          Your account doesn&apos;t have permission for this area. Go to your own dashboard,
          or sign out and sign in with a different account.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {homeHref && (
            <Link
              href={homeHref}
              className="inline-flex h-9 items-center rounded-lg bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Go to my dashboard
            </Link>
          )}
          <LogoutButton variant="secondary" />
        </div>
      </Card>
    </main>
  );
}
