"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { SearchIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";

import type { DirectoryFilterOptions } from "../types/directory";

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/15";

/**
 * Name / location search and state / district / category filters. Everything
 * lives in the URL (?search=&state=...), so results are shareable and the
 * page is rendered on the server with real data.
 */
export function DirectoryFilters({ options }: { options: DirectoryFilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [location, setLocation] = useState(params.get("location") ?? "");

  function apply(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page"); // any new filter starts at page 1
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  }

  // Text inputs: wait until typing pauses.
  useEffect(() => {
    const current = { search: params.get("search") ?? "", location: params.get("location") ?? "" };
    const typed = { search: search.trim(), location: location.trim() };
    if (typed.search === current.search && typed.location === current.location) return;
    const timer = setTimeout(() => apply(typed), 350);
    return () => clearTimeout(timer);
    // apply() reads the latest params; re-run only when the text changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, location]);

  const state = params.get("state") ?? "";
  const district = params.get("district") ?? "";
  const category = params.get("hospital_category") ?? "";
  const hasFilters = Boolean(search || location || state || district || category);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1.1fr_1fr_1fr_1fr]">
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          width={18}
          height={18}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hospital name"
          aria-label="Search by hospital name"
          className={`${inputClass} pl-10`}
        />
        {isPending && <Spinner className="absolute right-3 top-3 size-4 text-brand" />}
      </div>
      <input
        type="search"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location or address"
        aria-label="Search by location or address"
        className={inputClass}
      />
      <select
        value={state}
        onChange={(e) => apply({ state: e.target.value, district: "" })}
        aria-label="Filter by state"
        className={inputClass}
      >
        <option value="">All states</option>
        {options.states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={district}
        onChange={(e) => apply({ district: e.target.value })}
        aria-label="Filter by district"
        disabled={!state}
        title={state ? undefined : "Choose a state first"}
        className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <option value="">{state ? "All districts" : "District (pick a state)"}</option>
        {options.districts.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        value={category}
        onChange={(e) => apply({ hospital_category: e.target.value })}
        aria-label="Filter by hospital category"
        className={inputClass}
      >
        <option value="">All categories</option>
        {options.categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setLocation("");
            startTransition(() => router.replace(pathname));
          }}
          className="justify-self-start text-sm font-medium text-brand hover:underline sm:col-span-2 lg:col-span-5"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
