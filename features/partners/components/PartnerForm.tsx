"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/toast";

import { makePartnerAction, updatePartnerAction } from "../actions/partnerActions";
import type { Partner, PartnerFieldErrors, PartnerFormState } from "../types/partner";
import {
  hasFieldErrors,
  normalizePartnerInput,
  PARTNER_CATEGORIES,
  validatePartnerInput,
} from "../validation";

interface PartnerFormProps {
  directoryId: number;
  /** Omit to create the partner login; pass the partner to edit its email and category. */
  partner?: Partner;
  onDone: () => void;
}

const initialState: PartnerFormState = {};

export function PartnerForm({ directoryId, partner, onDone }: PartnerFormProps) {
  const isEdit = Boolean(partner);
  const action = (isEdit ? updatePartnerAction : makePartnerAction).bind(null, directoryId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<PartnerFieldErrors>({});
  const handledSuccess = useRef<number | undefined>(undefined);

  // React once to each success: message, then close the dialog.
  useEffect(() => {
    if (state.successAt && state.successAt !== handledSuccess.current) {
      handledSuccess.current = state.successAt;
      toast.success(state.successMessage ?? "Saved.");
      onDone();
    }
  }, [state, onDone]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const errors = validatePartnerInput(
      normalizePartnerInput({
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
        category: String(data.get("category") ?? ""),
      }),
      { requirePassword: !isEdit },
    );
    setClientErrors(errors);
    if (hasFieldErrors(errors)) event.preventDefault();
  }

  const clear = (field: keyof PartnerFieldErrors) => () =>
    clientErrors[field] && setClientErrors((e) => ({ ...e, [field]: undefined }));

  // Server errors arrive after a submit; client errors are shown before one.
  const errors = { ...state.fieldErrors, ...clientErrors };
  const values = state.successAt ? undefined : state.values;

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {state.message && <Alert>{state.message}</Alert>}

      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        placeholder="citycare@example.com"
        autoComplete="off"
        defaultValue={values?.email ?? partner?.email}
        error={errors.email}
        hint={isEdit ? undefined : "The partner signs in with this email."}
        onChange={clear("email")}
        disabled={isPending}
        autoFocus
      />
      {!isEdit && (
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          error={errors.password}
          onChange={clear("password")}
          disabled={isPending}
        />
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="partner-category" className="text-sm font-medium text-ink">
          Category
        </label>
        <select
          id="partner-category"
          name="category"
          defaultValue={values?.category ?? partner?.category ?? ""}
          onChange={clear("category")}
          disabled={isPending}
          aria-invalid={errors.category ? true : undefined}
          className={`h-11 w-full rounded-lg border bg-surface px-3 text-[15px] text-ink outline-none transition focus:ring-4 ${
            errors.category
              ? "border-danger focus:border-danger focus:ring-danger/15"
              : "border-line focus:border-brand focus:ring-brand/15"
          }`}
        >
          <option value="" disabled>
            Select a category
          </option>
          {PARTNER_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-danger">{errors.category}</p>}
      </div>

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Create partner"}
        </Button>
      </div>
    </form>
  );
}
