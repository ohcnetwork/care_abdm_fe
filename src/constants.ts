import { ConsentHIType, ConsentPurpose } from "./types";

export const ABDM_CONSENT_PURPOSE = [
  "CAREMGT",
  "BTG",
  "PUBHLTH",
  "HPAYMT",
  "DSRCH",
  "PATRQT",
] as ConsentPurpose[];

export const ABDM_HI_TYPE = [
  "Prescription",
  "DiagnosticReport",
  "OPConsultation",
  "DischargeSummary",
  "ImmunizationRecord",
  "HealthDocumentRecord",
  "WellnessRecord",
] as ConsentHIType[];
