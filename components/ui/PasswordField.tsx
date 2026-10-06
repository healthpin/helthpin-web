"use client";

import { useState } from "react";

import { EyeIcon, EyeOffIcon } from "./icons";
import { TextField, type TextFieldProps } from "./TextField";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "trailing">;

/** Password input with a show/hide toggle. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="grid size-9 cursor-pointer place-items-center rounded-md text-subtle hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
