import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Rendered inside the input on the right (e.g. a show-password button). */
  trailing?: ReactNode;
}

/** Labelled input with error/hint text wired up for screen readers. */
export function TextField({
  label,
  error,
  hint,
  trailing,
  id,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "h-11 w-full rounded-lg border bg-surface px-3.5 text-[15px] text-ink outline-none transition",
            "placeholder:text-subtle focus:ring-4",
            error
              ? "border-danger focus:border-danger focus:ring-danger/15"
              : "border-line focus:border-brand focus:ring-brand/15",
            trailing ? "pr-11" : undefined,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>
        )}
      </div>
      {message && (
        <p id={messageId} className={cn("text-sm", error ? "text-danger" : "text-muted")}>
          {message}
        </p>
      )}
    </div>
  );
}
