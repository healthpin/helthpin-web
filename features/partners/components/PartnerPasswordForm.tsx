"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { toast } from "@/components/ui/toast";

import { changePartnerPasswordAction } from "../actions/partnerActions";
import type { PasswordFormState } from "../types/partner";
import { validatePasswordChange } from "../validation";

const initialState: PasswordFormState = {};

/** New password + confirmation for one partner. */
export function PartnerPasswordForm({
  directoryId,
  onDone,
}: {
  directoryId: number;
  onDone: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    changePartnerPasswordAction.bind(null, directoryId),
    initialState,
  );
  const [clientErrors, setClientErrors] = useState<PasswordFormState["fieldErrors"]>({});
  const handledSuccess = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (state.successAt && state.successAt !== handledSuccess.current) {
      handledSuccess.current = state.successAt;
      toast.success(state.successMessage ?? "Password updated.");
      onDone();
    }
  }, [state, onDone]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const errors = validatePasswordChange(
      String(data.get("password") ?? ""),
      String(data.get("confirm") ?? ""),
    );
    setClientErrors(errors);
    if (errors.password || errors.confirm) event.preventDefault();
  }

  const errors = { ...state.fieldErrors, ...clientErrors };
  const clear = (field: "password" | "confirm") => () =>
    clientErrors?.[field] && setClientErrors((e) => ({ ...e, [field]: undefined }));

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {state.message && <Alert>{state.message}</Alert>}

      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        placeholder="Create a new password"
        error={errors.password}
        onChange={clear("password")}
        disabled={isPending}
        autoFocus
      />
      <PasswordField
        label="Confirm new password"
        name="confirm"
        autoComplete="new-password"
        placeholder="Enter it again"
        error={errors.confirm}
        onChange={clear("confirm")}
        disabled={isPending}
      />

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isPending ? "Saving…" : "Update password"}
        </Button>
      </div>
    </form>
  );
}
