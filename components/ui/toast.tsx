"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils/cn";

import { AlertIcon, CloseIcon, ShieldIcon } from "./icons";

/**
 * Tiny toast system: call toast.success("...") from any Client Component;
 * <Toaster /> (mounted once in AppShell) shows them.
 */
type Tone = "success" | "error";
interface ToastMessage {
  id: number;
  tone: Tone;
  text: string;
}

let messages: ToastMessage[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function dismiss(id: number) {
  messages = messages.filter((m) => m.id !== id);
  emit();
}

function push(tone: Tone, text: string) {
  const id = nextId++;
  messages = [...messages, { id, tone, text }];
  emit();
  setTimeout(() => dismiss(id), 4500);
}

export const toast = {
  success: (text: string) => push("success", text),
  error: (text: string) => push("error", text),
};

const EMPTY: ToastMessage[] = [];

export function Toaster() {
  const items = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => messages,
    () => EMPTY,
  );

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role={item.tone === "error" ? "alert" : "status"}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg",
            item.tone === "success"
              ? "border-success/20 bg-surface text-ink"
              : "border-danger/20 bg-danger-soft text-danger",
          )}
        >
          {item.tone === "success" ? (
            <ShieldIcon className="mt-px shrink-0 text-success" width={18} height={18} />
          ) : (
            <AlertIcon className="mt-px shrink-0" width={18} height={18} />
          )}
          <p className="flex-1 leading-5">{item.text}</p>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            aria-label="Dismiss"
            className="-m-1 cursor-pointer rounded p-1 text-subtle hover:text-ink"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
