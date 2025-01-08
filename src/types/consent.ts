import { AbhaNumber } from "./abhaNumber";

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

export type Consent = {
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

export type ConsentArtefact = {
  consent_request: string;

  cm: null | string;
} & Consent;

export type ConsentRequest = {
  requester: unknown; // FIXME: UserBareMinimum
  patient_abha_object: AbhaNumber;
  consent_artefacts: ConsentArtefact[];
} & Consent;
