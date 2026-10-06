"use client";

import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";

import { useLoginForm } from "../hooks/useLoginForm";
import type { LoginFieldErrors } from "../types/auth";
import { hasErrors, validateLoginInput } from "../validation";

interface LoginFormProps {
  /** Path to return to after signing in (validated again on the server). */
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const { state, formAction, isPending } = useLoginForm();
  // Instant feedback before submitting; the server validates again.
  const [clientErrors, setClientErrors] = useState<LoginFieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const errors = validateLoginInput(
      String(data.get("email") ?? "").trim(),
      String(data.get("password") ?? ""),
    );
    setClientErrors(errors);
    if (hasErrors(errors)) event.preventDefault();
  }

  const fieldErrors = { ...state.fieldErrors, ...clientErrors };

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}

      {state.message && <Alert>{state.message}</Alert>}

      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        placeholder="you@example.com"
        defaultValue={state.email}
        error={fieldErrors.email}
        disabled={isPending}
        onChange={() => clientErrors.email && setClientErrors((e) => ({ ...e, email: undefined }))}
        autoFocus
      />

      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={fieldErrors.password}
        disabled={isPending}
        onChange={() =>
          clientErrors.password && setClientErrors((e) => ({ ...e, password: undefined }))
        }
      />

      <Button type="submit" size="lg" fullWidth isLoading={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
