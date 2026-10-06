"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { toast } from "@/components/ui/toast";

import { createHospitalAction, updateHospitalAction } from "../actions/hospitalActions";
import type { Hospital, HospitalFieldErrors, HospitalFormState } from "../types/hospital";
import {
  hasFieldErrors,
  NAME_MAX_LENGTH,
  normalizeHospitalInput,
  PASSWORD_MIN_LENGTH,
  validateHospitalInput,
} from "../validation";

interface HospitalFormProps {
  /** Omit to create; pass a hospital to edit its name and email. */
  hospital?: Hospital;
  onDone: () => void;
}

const initialState: HospitalFormState = {};

export function HospitalForm({ hospital, onDone }: HospitalFormProps) {
  const isEdit = Boolean(hospital);
  const action = hospital ? updateHospitalAction.bind(null, hospital.id) : createHospitalAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<HospitalFieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const handledSuccess = useRef<number | undefined>(undefined);

  // React once to each success: message, clear the form, close the dialog.
  useEffect(() => {
    if (state.successAt && state.successAt !== handledSuccess.current) {
      handledSuccess.current = state.successAt;
      toast.success(state.successMessage ?? "Saved.");
      formRef.current?.reset();
      onDone();
    }
  }, [state, onDone]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const errors = validateHospitalInput(
      normalizeHospitalInput({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
      }),
      { requirePassword: !isEdit },
    );
    setClientErrors(errors);
    if (hasFieldErrors(errors)) event.preventDefault();
  }

  const clear = (field: keyof HospitalFieldErrors) => () =>
    clientErrors[field] && setClientErrors((e) => ({ ...e, [field]: undefined }));

  // Server errors arrive after a submit; client errors are shown before one.
  const errors = { ...state.fieldErrors, ...clientErrors };
  const values = state.successAt ? undefined : state.values;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      {state.message && <Alert>{state.message}</Alert>}

      <TextField
        label="Hospital name"
        name="name"
        placeholder="City Care Hospital"
        autoComplete="organization"
        maxLength={NAME_MAX_LENGTH}
        defaultValue={values?.name ?? hospital?.name}
        error={errors.name}
        onChange={clear("name")}
        disabled={isPending}
        autoFocus
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        placeholder="citycare@example.com"
        autoComplete="off"
        defaultValue={values?.email ?? hospital?.email}
        error={errors.email}
        hint={isEdit ? undefined : "The hospital signs in with this email."}
        onChange={clear("email")}
        disabled={isPending}
      />
      {!isEdit && (
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          error={errors.password}
          hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
          onChange={clear("password")}
          disabled={isPending}
        />
      )}

      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Create hospital"}
        </Button>
      </div>
    </form>
  );
}
