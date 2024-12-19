// These are types from core module (care_fe).

export type UserBareMinimum = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type:
    | "Pharmacist"
    | "Volunteer"
    | "StaffReadOnly"
    | "Staff"
    | "Nurse"
    | "Doctor"
    | "WardAdmin"
    | "LocalBodyAdmin"
    | "DistrictLabAdmin"
    | "DistrictReadOnlyAdmin"
    | "DistrictAdmin"
    | "StateLabAdmin"
    | "StateReadOnlyAdmin"
    | "StateAdmin";
  last_login: string | undefined;
  read_profile_picture_url?: string;
};

export interface LocationModel {
  id: string;
  name: string;
  description?: string;
  middleware_address?: string;
  location_type: string;
  facility?: {
    name: string;
  };
  created_date?: string;
  modified_date?: string;
}

export interface LocalBodyModel {
  id: number;
  name: string;
  body_type: number;
  localbody_code: string;
  district: number;
}

export interface DistrictModel {
  id: number;
  name: string;
  state: number;
}

export interface StateModel {
  id: number;
  name: string;
}

export interface WardModel {
  id: number;
  name: string;
  number: number;
  panchayath: string;
  local_body_id: LocalBodyModel["id"];
}

export interface FacilityModel {
  id?: string;
  name?: string;
  read_cover_image_url?: string;
  facility_type?: string;
  address?: string;
  features?: number[];
  location?: {
    latitude: number;
    longitude: number;
  };
  phone_number?: string;
  middleware_address?: string;
  local_body_object?: LocalBodyModel;
  district_object?: DistrictModel;
  state_object?: StateModel;
  ward_object?: WardModel;
  modified_date?: string;
  created_date?: string;
  state?: number;
  district?: number;
  local_body?: number;
  ward?: number;
  pincode?: string;
  facility_flags?: string[];
  latitude?: string;
  longitude?: string;
  kasp_empanelled?: boolean;
  patient_count?: number;
  bed_count?: number;
}

export interface AssignedToObjectModel {
  first_name: string;
  last_name: string;
  last_login?: string;
  alt_phone_number?: string;
  user_type: string;
}

export type PatientCategory =
  | "Comfort Care" // Discontinued
  | "Mild"
  | "Moderate"
  | "Critical"
  | "Actively Dying";

export type ICD11DiagnosisModel = {
  id: string;
  label: string;
  chapter?: string;
};

export interface ConsultationDiagnosis {
  readonly id: string;
  diagnosis?: ICD11DiagnosisModel["id"];
  readonly diagnosis_object: ICD11DiagnosisModel;
  verification_status:
    | "unconfirmed"
    | "provisional"
    | "differential"
    | "confirmed"
    | "refuted"
    | "entered-in-error";
  is_principal: boolean;
  readonly is_migrated: boolean;
  readonly created_by: UserBareMinimum;
  readonly created_date: string;
  readonly modified_date: string;
}

export interface CreateDiagnosis {
  diagnosis: ICD11DiagnosisModel["id"];
  readonly diagnosis_object?: ICD11DiagnosisModel;
  verification_status:
    | "unconfirmed"
    | "provisional"
    | "differential"
    | "confirmed";
  is_principal: boolean;
}

export type InvestigationType = {
  type?: string[];
  repetitive?: boolean;
  time?: string;
  frequency?: string;
  notes?: string;
};

export interface EncounterSymptom {
  readonly id: string;
  readonly modified_date: string;
  readonly created_date: string;
  readonly created_by: UserBareMinimum;
  readonly updated_by: UserBareMinimum;
  symptom: number;
  other_symptom?: string | null;
  onset_date: string;
  cure_date?: string | null;
  readonly clinical_impression_status:
    | "entered-in-error"
    | "in-progress"
    | "completed";
  readonly is_migrated: boolean;
}

export type ProcedureType = {
  procedure?: string;
  repetitive?: boolean;
  time?: string;
  frequency?: string;
  notes?: string;
};

export interface BedModel {
  id?: string;
  bed_type?: string;
  name?: string;
  description?: string;
  facility?: string;
  location_object?: {
    name: string;
    id: string;
    facility?: { name: string; id: string };
  };
  location?: string;
  is_occupied?: boolean;
  created_date?: string;
  modified_date?: string;
}

export interface ResolvedMiddleware {
  hostname: string;
  source: "asset" | "location" | "facility";
}

export interface AssetLocationObject {
  id?: string;
  name: string;
  description: string;
  created_date?: string;
  modified_date?: string;
  location_type: string;
  middleware_address?: string;
  facility?: {
    id: string;
    name: string;
  };
}

export interface AssetService {
  id: string;
  created_date: string;
  modified_date: string;
  serviced_on: string;
  note: string;
}

export interface AssetData {
  id: string;
  name: string;
  location: string;
  description: string;
  is_working: boolean;
  not_working_reason: string;
  created_date: string;
  modified_date: string;
  serial_number: string;
  asset_type: string;
  asset_class?: string;
  location_object: AssetLocationObject;
  status: "ACTIVE" | "TRANSFER_IN_PROGRESS";
  vendor_name: string;
  support_name: string;
  support_email: string;
  support_phone: string;
  qr_code_id: string;
  manufacturer: string;
  warranty_amc_end_of_validity: string;
  resolved_middleware?: ResolvedMiddleware;
  latest_status: string;
  last_service: AssetService;
  meta?: {
    middleware_hostname?: string;
    local_ip_address?: string;
    camera_access_key?: string;
    [key: string]: any;
  };
}

export interface CurrentBed {
  id: string;
  consultation: string;
  bed?: string;
  bed_object: BedModel;
  assets_objects?: AssetData[];
  created_date: string;
  modified_date: string;
  start_date: string;
  end_date: string;
  meta: Record<string, any>;
}

export interface ConsultationModel {
  encounter_date: string;
  icu_admission_date?: string;
  admitted?: boolean;
  test_id?: string;
  admitted_to?: string;
  category?: PatientCategory;
  created_date?: string;
  discharge_date?: string;
  new_discharge_reason?: number;
  discharge_notes?: string;
  examination_details?: string;
  history_of_present_illness?: string;
  facility: string;
  facility_name?: string;
  id: string;
  modified_date?: string;
  patient: string;
  treatment_plan?: string;
  referred_to?: FacilityModel["id"];
  referred_to_object?: FacilityModel;
  referred_to_external?: string;
  referred_from_facility?: FacilityModel["id"];
  referred_from_facility_object?: FacilityModel;
  referred_from_facility_external?: string;
  referred_by_external?: string;
  transferred_from_location?: LocationModel["id"];
  transferred_from_location_object?: LocationModel;
  suggestion?: "HI" | "A" | "R" | "OP" | "DC" | "DD";
  patient_no?: string;
  route_to_facility?: number;
  is_kasp?: boolean;
  kasp_enabled_date?: string;
  readonly diagnoses?: ConsultationDiagnosis[];
  create_diagnoses?: CreateDiagnosis[]; // Used for bulk creating diagnoses upon consultation creation
  readonly symptoms?: EncounterSymptom[];
  create_symptoms?: CreateDiagnosis[]; // Used for bulk creating symptoms upon consultation creation
  deprecated_verified_by?: string;
  readonly treating_physician?: UserBareMinimum["id"];
  treating_physician_object?: UserBareMinimum;
  suggestion_text?: string;
  consultation_notes?: string;
  is_telemedicine?: boolean;
  procedure?: ProcedureType[];
  assigned_to?: string;
  assigned_to_object?: AssignedToObjectModel;
  created_by?: any;
  last_edited_by?: any;
  weight?: number | null;
  height?: number | null;
  operation?: string;
  special_instruction?: string;
  intubation_start_date?: string;
  intubation_end_date?: string;
  ett_tt?: number;
  cuff_pressure?: number;
  lines?: any;
  last_daily_round?: DailyRoundsModel;
  current_bed?: CurrentBed;
  review_interval?: number;
  cause_of_death?: string;
  death_datetime?: string;
  death_confirmed_doctor?: string;
  is_readmission?: boolean;
  medico_legal_case?: boolean;
  investigation?: InvestigationType[];
  has_consents?: number[];
}

export interface PatientMeta {
  readonly id: number;
  occupation?: string;
  socioeconomic_status?: "MIDDLE_CLASS" | "POOR" | "VERY_POOR" | "WELL_OFF";
  domestic_healthcare_support?:
    | "FAMILY_MEMBER"
    | "PAID_CAREGIVER"
    | "NO_SUPPORT";
}

export interface PatientModel {
  id?: string;
  action?: number;
  name?: string;
  allow_transfer?: boolean;
  discharge?: boolean;
  gender?: number;
  created_date?: string;
  modified_date?: string;
  facility?: string;
  phone_number?: string;
  emergency_phone_number?: string;
  allergies?: string;
  medical_history?: Array<{ disease: string | number; details: string }>;
  facility_object?: {
    id: number;
    name: string;
    facility_type?: { id: number; name: string };
  };
  contact_with_carrier?: boolean;
  medical_history_details?: string;
  is_active?: boolean;
  is_antenatal?: boolean;
  last_menstruation_start_date?: string;
  date_of_delivery?: string;
  is_migrant_worker?: boolean;
  ward?: string;
  local_body_object?: { id: number; name: string };
  ward_object?: { id: number; name: string; number: number };
  district_object?: { id: number; name: string };
  state_object?: { id: number; name: string };
  tele_consultation_history?: Array<any>;
  last_consultation?: ConsultationModel;
  address?: string;
  permanent_address?: string;
  sameAddress?: boolean;
  village?: string;
  pincode?: number;
  is_medical_worker?: boolean;
  designation_of_health_care_worker?: string;
  instituion_of_health_care_worker?: string;
  frontline_worker?: string;
  past_travel?: boolean;
  ongoing_medication?: string;
  countries_travelled?: Array<string>;
  transit_details?: string;
  present_health?: string;
  has_SARI?: boolean;
  local_body?: number;
  district?: number;
  state?: number;
  nationality?: string;
  passport_no?: string;
  ration_card_category?: "BPL" | "APL" | "NO_CARD" | null;
  date_of_test?: string;
  date_of_result?: string; // keeping this to avoid errors in Death report
  covin_id?: string;
  is_vaccinated?: boolean;
  vaccine_name?: string;
  number_of_doses?: number;
  last_vaccinated_date?: string;
  date_of_birth?: string;
  year_of_birth?: number;
  readonly death_datetime?: string;
  blood_group?: string;
  review_interval?: number;
  review_time?: string;
  date_of_return?: string;
  number_of_aged_dependents?: number;
  number_of_chronic_diseased_dependents?: number;
  will_donate_blood?: boolean;
  fit_for_blood_donation?: boolean;
  date_declared_positive?: string;
  is_declared_positive?: boolean;
  last_edited?: UserBareMinimum;
  created_by?: UserBareMinimum;
  assigned_to?: number | null;
  assigned_to_object?: AssignedToObjectModel;
  occupation?: string;
  meta_info?: PatientMeta;
  age?: string;
}

export type DailyRoundsModel = unknown;
