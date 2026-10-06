"use client";

import { useActionState } from "react";

import { loginAction } from "../actions/authActions";
import type { LoginFormState } from "../types/auth";

const initialState: LoginFormState = {};

/** Login form state: the Server Action, its result and the pending flag. */
export function useLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  return { state, formAction, isPending };
}
