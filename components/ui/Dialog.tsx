"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { CloseIcon } from "./icons";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Modal built on the native <dialog>: focus is trapped and Escape closes it
 * without extra code. Clicking the backdrop closes it too.
 */
export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose(); // backdrop click
      }}
      aria-labelledby="dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-canvas"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
