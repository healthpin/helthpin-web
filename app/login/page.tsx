import type { Metadata } from "next";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { LoginForm } from "@/features/authentication/components/LoginForm";
import { safeRedirectPath } from "@/features/authentication/validation";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next) ?? undefined;
  const expired = params.expired === "1";

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Sign in</h1>
        <p className="mt-1.5 text-sm text-muted">
          Super Admins and hospitals sign in here with their email and password.
        </p>
      </div>
      {expired && (
        <div className="mb-5">
          <Alert tone="info">Your session has ended. Please sign in again.</Alert>
        </div>
      )}
      <LoginForm next={next} />
    </AuthLayout>
  );
}
