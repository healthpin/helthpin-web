import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { ArrowLeftIcon, MapPinIcon } from "@/components/ui/icons";
import { getDirectoryHospital } from "@/features/hospital-directory/api/directoryApi";
import { EditHospitalButton } from "@/features/hospital-directory/components/EditHospitalButton";
import { MakePartnerButton } from "@/features/partners/components/MakePartnerButton";
import { PartnerPanel } from "@/features/partners/components/PartnerPanel";
import { DjangoApiError } from "@/lib/api/django";
import { withAdminToken } from "@/lib/auth/adminRequest";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Hospital details" };

const LIST = "/dashboard/hospital-directory";

/** "19.07, 72.87" -> a map link; anything else -> null. */
function mapsUrl(coordinates: string): string | null {
  const match = coordinates.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  return match ? `https://www.google.com/maps?q=${match[1]},${match[2]}` : null;
}

/** Website values are free text: link only things that look like a web address. */
function websiteUrl(value: string): string | null {
  if (!/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/i.test(value)) return null;
  return /^https?:\/\//i.test(value) ? value : `http://${value}`;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</dt>
      <dd className="mt-1 break-words text-sm text-ink">{children}</dd>
    </div>
  );
}

const show = (value: string) => value || <span className="text-subtle">Not provided</span>;

export default async function DirectoryHospitalPage({
  params,
  searchParams,
}: PageProps<"/dashboard/hospital-directory/[id]">) {
  await requireSuperAdmin();
  const { id } = await params;
  const { back } = await searchParams;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();

  let hospital, partner;
  try {
    ({ hospital, partner } = await withAdminToken((token) => getDirectoryHospital(token, numericId)));
  } catch (error) {
    if (error instanceof DjangoApiError && error.status === 404) notFound();
    throw error;
  }

  // Only our own list's query string is used for the back link.
  const backHref =
    typeof back === "string" && !back.includes("/") ? `${LIST}?${back}` : LIST;
  const map = mapsUrl(hospital.location_coordinates);
  const website = websiteUrl(hospital.website);
  const specialties = splitList(hospital.specialties);
  const facilities = splitList(hospital.facilities);

  return (
    <>
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeftIcon width={16} height={16} />
        Back to directory
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">{hospital.hospital_name}</h2>
          <p className="mt-1 text-sm text-muted">
            {[hospital.district, hospital.state].filter(Boolean).join(", ") || "Location not provided"}
            {hospital.hospital_category ? ` · ${hospital.hospital_category}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          {!partner && (
            <MakePartnerButton directoryId={hospital.id} hospitalName={hospital.hospital_name} />
          )}
          <EditHospitalButton hospital={hospital} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {partner && <PartnerPanel partner={partner} hospitalName={hospital.hospital_name} />}
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-ink">Location</h3>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Field label="Address">{show(hospital.address_original_first_line)}</Field>
            <Field label="Location">{show(hospital.location)}</Field>
            <Field label="State">{show(hospital.state)}</Field>
            <Field label="District">{show(hospital.district)}</Field>
            <Field label="Subdistrict">{show(hospital.subdistrict)}</Field>
            <Field label="Pincode">{show(hospital.pincode)}</Field>
            <Field label="Location coordinates">
              {hospital.location_coordinates ? (
                <span className="inline-flex flex-wrap items-center gap-2">
                  {hospital.location_coordinates}
                  {map && (
                    <a
                      href={map}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand hover:underline"
                    >
                      <MapPinIcon width={14} height={14} />
                      Map
                    </a>
                  )}
                </span>
              ) : (
                show("")
              )}
            </Field>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-ink">Contact</h3>
          <dl className="grid gap-5">
            <Field label="Telephone">{show(hospital.telephone)}</Field>
            <Field label="Mobile number">{show(hospital.mobile_number)}</Field>
            <Field label="Emergency number">{show(hospital.emergency_num)}</Field>
            <Field label="Ambulance phone">{show(hospital.ambulance_phone_no)}</Field>
            <Field label="Blood bank phone">{show(hospital.bloodbank_phone_no)}</Field>
            <Field label="Website">
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-brand hover:underline"
                >
                  {hospital.website}
                </a>
              ) : (
                show(hospital.website)
              )}
            </Field>
          </dl>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <h3 className="mb-4 text-base font-semibold text-ink">Medical services</h3>
          <dl className="grid gap-6">
            <Field label="Hospital category">{show(hospital.hospital_category)}</Field>
            <Field label="Discipline / systems of medicine">
              {show(hospital.discipline_systems_of_medicine)}
            </Field>
            <Field label={`Specialties${specialties.length ? ` (${specialties.length})` : ""}`}>
              {specialties.length ? <Chips items={specialties} /> : show("")}
            </Field>
            <Field label={`Facilities${facilities.length ? ` (${facilities.length})` : ""}`}>
              {facilities.length ? <Chips items={facilities} /> : show("")}
            </Field>
          </dl>
        </Card>
      </div>
    </>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-1 flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
          {item}
        </li>
      ))}
    </ul>
  );
}
