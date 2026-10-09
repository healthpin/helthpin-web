import { formatDate, formatTime, type Booking } from "../types/booking";
import { BookingActions } from "./BookingActions";
import { BookingStatusBadge } from "./BookingStatusBadge";

/** Table on wide screens, stacked cards on phones. */
export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-subtle">
              <th scope="col" className="px-5 py-3">Booking</th>
              <th scope="col" className="px-4 py-3">Patient</th>
              <th scope="col" className="px-4 py-3">Doctor</th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Token / time</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {bookings.map((b) => (
              <tr key={b.booking_id} className="align-top hover:bg-canvas/60">
                <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">{b.code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{b.patient_name}</div>
                  <div className="text-muted">{b.patient_phone || "—"}</div>
                  {b.notes && <div className="mt-0.5 max-w-60 text-xs text-subtle">{b.notes}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="text-ink">{b.doctor_name}</div>
                  <div className="text-muted">{b.specialization}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(b.booking_date)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="font-medium text-ink">Token {b.token_number}</div>
                  <div className="text-muted">
                    {formatTime(b.slot_start)}–{formatTime(b.slot_end)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="px-5 py-3">
                  <BookingActions bookingId={b.booking_id} status={b.status} patientName={b.patient_name} when={{ date: b.booking_date, time: b.slot_start }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line lg:hidden">
        {bookings.map((b) => (
          <li key={b.booking_id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-ink">{b.patient_name}</div>
                <div className="text-sm text-muted">{b.patient_phone || "No phone"}</div>
              </div>
              <BookingStatusBadge status={b.status} />
            </div>
            <div className="text-sm text-muted">
              {b.doctor_name} · {b.specialization}
              <br />
              {formatDate(b.booking_date)} · Token {b.token_number} · {formatTime(b.slot_start)}–
              {formatTime(b.slot_end)}
            </div>
            {b.notes && <div className="text-xs text-subtle">{b.notes}</div>}
            <BookingActions bookingId={b.booking_id} status={b.status} patientName={b.patient_name} when={{ date: b.booking_date, time: b.slot_start }} />
          </li>
        ))}
      </ul>
    </>
  );
}
