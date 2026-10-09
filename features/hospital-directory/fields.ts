import type { DirectoryHospital } from "./types/directory";

/** Editable directory fields, in the order the Edit form shows them. */
export const DIRECTORY_FIELDS: {
  name: Exclude<keyof DirectoryHospital, "id">;
  label: string;
  multiline?: boolean;
}[] = [
  { name: "hospital_name", label: "Hospital name" },
  { name: "hospital_category", label: "Hospital category" },
  { name: "address_original_first_line", label: "Address", multiline: true },
  { name: "location", label: "Location" },
  { name: "location_coordinates", label: "Location coordinates" },
  { name: "state", label: "State" },
  { name: "district", label: "District" },
  { name: "subdistrict", label: "Subdistrict" },
  { name: "pincode", label: "Pincode" },
  { name: "telephone", label: "Telephone" },
  { name: "mobile_number", label: "Mobile number" },
  { name: "emergency_num", label: "Emergency number" },
  { name: "ambulance_phone_no", label: "Ambulance phone" },
  { name: "bloodbank_phone_no", label: "Blood bank phone" },
  { name: "website", label: "Website" },
  { name: "discipline_systems_of_medicine", label: "Discipline / systems of medicine", multiline: true },
  { name: "specialties", label: "Specialties (comma separated)", multiline: true },
  { name: "facilities", label: "Facilities (comma separated)", multiline: true },
];
