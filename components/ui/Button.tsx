import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_5px_14px_-7px_rgba(138,16,68,0.72)] hover:bg-brand-hover hover:shadow-[0_7px_18px_-8px_rgba(138,16,68,0.72)] active:translate-y-px focus-visible:outline-brand disabled:bg-line disabled:text-subtle disabled:shadow-none",
  secondary:
    "border border-line bg-surface text-ink hover:border-brand/30 hover:bg-brand-soft focus-visible:outline-brand",
  ghost: "text-muted hover:bg-brand-soft hover:text-brand focus-visible:outline-brand",
  danger: "bg-danger-soft text-danger hover:bg-danger/15 focus-visible:outline-danger",
};

const sizes: Record<Size, string> = {
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leadingIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-[10px] font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner /> : leadingIcon}
      {children}
    </button>
  );
}
