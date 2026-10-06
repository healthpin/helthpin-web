import Link from "next/link";

import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  /** Builds the link for a page, keeping other query params (e.g. search). */
  hrefForPage: (page: number) => string;
}

/** "Showing 21–40 of 53" with Previous / Next links. Server-rendered. */
export function Pagination({ page, totalPages, totalCount, pageSize, hrefForPage }: PaginationProps) {
  if (totalCount === 0) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalCount);

  const linkClass = (disabled: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm font-medium",
      disabled ? "pointer-events-none text-subtle opacity-50" : "bg-surface text-ink hover:bg-canvas",
    );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 pt-4">
      <p className="text-sm text-muted">
        Showing <span className="font-medium text-ink">{first}</span>–
        <span className="font-medium text-ink">{last}</span> of{" "}
        <span className="font-medium text-ink">{totalCount}</span>
      </p>
      {totalPages > 1 && (
        <div className="flex gap-2">
          <Link
            href={hrefForPage(page - 1)}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={linkClass(page <= 1)}
          >
            Previous
          </Link>
          <Link
            href={hrefForPage(page + 1)}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={linkClass(page >= totalPages)}
          >
            Next
          </Link>
        </div>
      )}
    </nav>
  );
}
