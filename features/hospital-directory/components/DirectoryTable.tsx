import Link from "next/link";

import type { DirectoryHospitalSummary } from "../types/directory";

const dash = (value: string) => value || "—";

/** Table on wide screens, stacked cards on phones. Each row opens the details. */
export function DirectoryTable({
  hospitals,
  detailHref,
}: {
  hospitals: DirectoryHospitalSummary[];
  detailHref: (id: number) => string;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-subtle">
              <th scope="col" className="px-5 py-3">Hospital name</th>
              <th scope="col" className="px-4 py-3">Location</th>
              <th scope="col" className="px-4 py-3">State</th>
              <th scope="col" className="px-4 py-3">District</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">Telephone</th>
              <th scope="col" className="px-4 py-3">Mobile</th>
              <th scope="col" className="px-4 py-3">Website</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {hospitals.map((h) => (
              <tr key={h.id} className="group hover:bg-canvas/60">
                <td className="max-w-72 px-5 py-3">
                  <Link
                    href={detailHref(h.id)}
                    className="font-medium text-ink group-hover:text-brand hover:underline"
                  >
                    {h.hospital_name}
                  </Link>
                </td>
                <td className="max-w-56 truncate px-4 py-3 text-muted" title={h.location}>
                  {dash(h.location)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{dash(h.state)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{dash(h.district)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{dash(h.hospital_category)}</td>
                <td className="max-w-40 truncate px-4 py-3 text-muted" title={h.telephone}>
                  {dash(h.telephone)}
                </td>
                <td className="max-w-36 truncate px-4 py-3 text-muted" title={h.mobile_number}>
                  {dash(h.mobile_number)}
                </td>
                <td className="max-w-48 truncate px-4 py-3 text-muted" title={h.website}>
                  {dash(h.website)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line lg:hidden">
        {hospitals.map((h) => (
          <li key={h.id}>
            <Link href={detailHref(h.id)} className="block px-4 py-4 hover:bg-canvas/60">
              <p className="font-medium text-ink">{h.hospital_name}</p>
              <p className="mt-0.5 text-sm text-muted">
                {[h.district, h.state].filter(Boolean).join(", ") || "—"}
              </p>
              <p className="mt-1 text-xs text-subtle">
                {[h.hospital_category, h.telephone].filter(Boolean).join(" · ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
