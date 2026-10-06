import { formatDate } from "@/lib/utils/format";

import type { Hospital } from "../types/hospital";
import { HospitalRowActions } from "./HospitalRowActions";
import { HospitalStatusBadge } from "./HospitalStatusBadge";

/** Table on wide screens, stacked cards on phones. */
export function HospitalsTable({ hospitals }: { hospitals: Hospital[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-subtle">
              <th scope="col" className="px-5 py-3">Hospital name</th>
              <th scope="col" className="px-5 py-3">Email</th>
              <th scope="col" className="px-5 py-3">Created</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {hospitals.map((hospital) => (
              <tr key={hospital.id} className="hover:bg-canvas/60">
                <td className="px-5 py-3.5 font-medium text-ink">{hospital.name}</td>
                <td className="px-5 py-3.5 text-muted">{hospital.email}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-muted">
                  {formatDate(hospital.created_at)}
                </td>
                <td className="px-5 py-3.5">
                  <HospitalStatusBadge active={hospital.is_active} />
                </td>
                <td className="px-5 py-2">
                  <HospitalRowActions hospital={hospital} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {hospitals.map((hospital) => (
          <li key={hospital.id} className="flex flex-col gap-2 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{hospital.name}</p>
                <p className="truncate text-sm text-muted">{hospital.email}</p>
              </div>
              <HospitalStatusBadge active={hospital.is_active} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-subtle">Created {formatDate(hospital.created_at)}</p>
              <HospitalRowActions hospital={hospital} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
