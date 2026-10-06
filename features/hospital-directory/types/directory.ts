/**
 * Hospital directory: data imported from the national hospital CSV.
 * Read-only reference data, NOT hospital login accounts (see features/hospitals).
 */

/** A row in the list (GET /hospitals/directory/). */
export interface DirectoryHospitalSummary {
  id: number;
  hospital_name: string;
  location: string;
  state: string;
  district: string;
  hospital_category: string;
  telephone: string;
  mobile_number: string;
  website: string;
}

/** All 18 directory fields (GET /hospitals/directory/{id}/). "" = not provided. */
export interface DirectoryHospital {
  id: number;
  hospital_name: string;
  location_coordinates: string;
  location: string;
  hospital_category: string;
  discipline_systems_of_medicine: string;
  address_original_first_line: string;
  state: string;
  district: string;
  subdistrict: string;
  pincode: string;
  telephone: string;
  mobile_number: string;
  emergency_num: string;
  ambulance_phone_no: string;
  bloodbank_phone_no: string;
  website: string;
  specialties: string;
  facilities: string;
}

export interface DirectoryPage {
  success: true;
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: DirectoryHospitalSummary[];
}

export interface DirectoryQuery {
  search?: string;
  location?: string;
  state?: string;
  district?: string;
  hospital_category?: string;
  page?: number;
}

export interface DirectoryFilterOptions {
  states: string[];
  categories: string[];
  /** Districts of the selected state (empty without a state). */
  districts: string[];
}
