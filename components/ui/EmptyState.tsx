import type { ComponentType, ReactNode } from "react";

import type { IconProps } from "./icons";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<IconProps>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
        <Icon />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
