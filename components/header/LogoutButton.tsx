"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/Button";
import { LogoutIcon } from "@/components/ui/icons";
import { logoutAction } from "@/features/authentication/actions/authActions";

function SubmitButton({ variant = "ghost", size = "sm", ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      isLoading={pending}
      leadingIcon={<LogoutIcon width={18} height={18} />}
      {...props}
    >
      <span>{pending ? "Signing out…" : "Sign out"}</span>
    </Button>
  );
}

/** Signs out through a Server Action (revokes the refresh token on Django). */
export function LogoutButton(props: ButtonProps) {
  return (
    <form action={logoutAction}>
      <SubmitButton {...props} />
    </form>
  );
}
