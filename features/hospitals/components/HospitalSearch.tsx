"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { SearchIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";

/** Search box that keeps the query in the URL (?search=), so it's shareable. */
export function HospitalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("search") ?? "";
  const [value, setValue] = useState(current);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const term = value.trim();
    if (term === current) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) params.set("search", term);
      else params.delete("search");
      params.delete("page"); // new search starts at page 1
      const qs = params.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
    }, 300);
    return () => clearTimeout(timer);
  }, [value, current, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <SearchIcon
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
        width={18}
        height={18}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by name or email"
        aria-label="Search hospitals by name or email"
        className="h-10 w-full rounded-lg border border-line bg-surface pl-10 pr-9 text-sm outline-none placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/15"
      />
      {isPending && <Spinner className="absolute right-3 top-3 size-4 text-brand" />}
    </div>
  );
}
