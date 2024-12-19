import { PatientModel, UserBareMinimum } from "./external";

export type AbhaNumberModel = {
  id: number;
  external_id: string;
  created_date: string;
  modified_date: string;
  abha_number: string;
  health_id: string;
  name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  gender: "F" | "M" | "O";
  date_of_birth: string | null;
  address: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  mobile: string | null;
  email: string | null;
  profile_photo: string | null;
  new: boolean;
  patient: string | null;
  patient_object: PatientModel | null;
};

export type ABHAQRContent = {
  hidn: string;
  name: string;
  gender: "M" | "F" | "O";
  dob: string;
  mobile: string;
  address: string;
  distlgd: string;
  statelgd: string;
} & ({ hid: string; phr?: never } | { phr: string; hid?: never }) &
  (
    | { district_name: string; "dist name"?: never }
    | { "dist name": string; district_name?: never }
  ) &
  (
    | { state_name: string; "state name"?: never }
    | { "state name": string; state_name?: never }
  );

export type ConsentPurpose =
  | "CAREMGT"
  | "BTG"
  | "PUBHLTH"
  | "HPAYMT"
  | "DSRCH"
  | "PATRQT";

export type ConsentStatus =
  | "REQUESTED"
  | "GRANTED"
  | "DENIED"
  | "EXPIRED"
  | "REVOKED";

export type ConsentHIType =
  | "Prescription"
  | "DiagnosticReport"
  | "OPConsultation"
  | "DischargeSummary"
  | "ImmunizationRecord"
  | "HealthDocumentRecord"
  | "WellnessRecord";

export type ConsentAccessMode = "VIEW" | "STORE" | "QUERY" | "STREAM";

export type ConsentFrequencyUnit = "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";

export type ConsentCareContext = {
  patientReference: string;
  careContextReference: string;
};

export type ConsentModel = {
  id: string;
  consent_id: null | string;

  patient_abha: string;
  care_contexts: ConsentCareContext[];

  status: ConsentStatus;
  purpose: ConsentPurpose;
  hi_types: ConsentHIType[];

  access_mode: ConsentAccessMode;
  from_time: string;
  to_time: string;
  expiry: string;

  frequency_unit: ConsentFrequencyUnit;
  frequency_value: number;
  frequency_repeats: number;

  hip: null | string;
  hiu: null | string;

  created_date: string;
  modified_date: string;
};

export type CreateConsentTBody = {
  patient_abha: string;
  hi_types: ConsentHIType[];
  purpose: ConsentPurpose;
  from_time: Date | string;
  to_time: Date | string;
  expiry: Date | string;

  access_mode?: ConsentAccessMode;
  frequency_unit?: ConsentFrequencyUnit;
  frequency_value?: number;
  frequency_repeats?: number;
  hip?: null | string;
};

export type ConsentArtefactModel = {
  consent_request: string;

  cm: null | string;
} & ConsentModel;

export type ConsentRequestModel = {
  requester: UserBareMinimum;
  patient_abha_object: AbhaNumberModel;
  consent_artefacts: ConsentArtefactModel[];
} & ConsentModel;

export type HealthFacilityModel = {
  id: string;
  registered: boolean;
  external_id: string;
  created_date: string;
  modified_date: string;
  hf_id: string;
  facility: string;
  detail?: string;
};

export type IcreateHealthFacilityTBody = {
  facility: string;
  hf_id: string;
};

export type IpartialUpdateHealthFacilityTBody = {
  hf_id: string;
};

export type HealthInformationModel = {
  data: {
    content: string;
    care_context_reference: string;
  }[];
};
