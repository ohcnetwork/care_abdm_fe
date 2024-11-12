import { Type } from "@/Utils/request/api";
import { PaginatedResponse } from "@/Utils/request/types";

import {
  AbhaNumberModel,
  ConsentRequestModel,
  CreateConsentTBody,
  HealthFacilityModel,
  HealthInformationModel,
  IcreateHealthFacilityTBody,
  IpartialUpdateHealthFacilityTBody,
} from "./types";

const routes = {
  consent: {
    list: {
      path: "/api/abdm/consent/",
      method: "GET",
      TRes: Type<PaginatedResponse<ConsentRequestModel>>(),
    },

    create: {
      path: "/api/abdm/consent/",
      method: "POST",
      TRes: Type<ConsentRequestModel>(),
      TBody: Type<CreateConsentTBody>(),
    },

    get: {
      path: "/api/abdm/consent/{id}/",
      method: "GET",
    },

    checkStatus: {
      path: "/api/abdm/v3/hiu/consent_request_status/",
      method: "POST",
      TBody: Type<{
        consent_request: string;
      }>(),
      TRes: Type<{
        detail: string;
      }>(),
    },
  },

  healthInformation: {
    get: {
      path: "/api/abdm/health_information/{artefactId}",
      method: "GET",
      TRes: Type<HealthInformationModel>(),
    },
  },

  healthFacility: {
    list: {
      path: "/api/abdm/health_facility/",
      method: "GET",
    },

    create: {
      path: "/api/abdm/health_facility/",
      method: "POST",
      TRes: Type<HealthFacilityModel>(),
      TBody: Type<IcreateHealthFacilityTBody>(),
    },

    get: {
      path: "/api/abdm/health_facility/{facility_id}/",
      method: "GET",
      TRes: Type<HealthFacilityModel>(),
    },

    update: {
      path: "/api/abdm/health_facility/{facility_id}/",
      method: "PUT",
      TRes: Type<HealthFacilityModel>(),
      TBody: Type<IcreateHealthFacilityTBody>(),
    },

    partialUpdate: {
      path: "/api/abdm/health_facility/{facility_id}/",
      method: "PATCH",
      TRes: Type<HealthFacilityModel>(),
      TBody: Type<IpartialUpdateHealthFacilityTBody>(),
    },

    registerAsService: {
      path: "/api/abdm/health_facility/{facility_id}/register_service/",
      method: "POST",
      TRes: Type<HealthFacilityModel>(),
      TBody: Type<IcreateHealthFacilityTBody>(),
    },
  },

  abhaNumber: {
    get: {
      path: "/api/abdm/abha_number/{abhaNumberId}/",
      method: "GET",
      TRes: Type<AbhaNumberModel>(),
    },
    create: {
      path: "/api/abdm/abha_number/",
      method: "POST",
      TBody: Type<Partial<AbhaNumberModel>>(),
      TRes: Type<AbhaNumberModel>(),
    },
  },

  healthId: {
    abhaCreateSendAadhaarOtp: {
      path: "/api/abdm/v3/health_id/create/send_aadhaar_otp/",
      method: "POST",
      TBody: Type<{
        aadhaar: string;
        transaction_id?: string;
      }>(),
      TRes: Type<{
        transaction_id: string;
        detail: string;
      }>(),
    },

    abhaCreateVerifyAadhaarOtp: {
      path: "/api/abdm/v3/health_id/create/verify_aadhaar_otp/",
      method: "POST",
      TBody: Type<{
        transaction_id: string;
        otp: string;
        mobile: string;
      }>(),
      TRes: Type<{
        transaction_id: string;
        detail: string;
        is_new: boolean;
        abha_number: AbhaNumberModel;
      }>(),
    },

    abhaCreateLinkMobileNumber: {
      path: "/api/abdm/v3/health_id/create/link_mobile_number/",
      method: "POST",
      TBody: Type<{
        transaction_id: string;
        mobile: string;
      }>(),
      TRes: Type<{
        transaction_id: string;
        detail: string;
      }>(),
    },

    abhaCreateVerifyMobileNumber: {
      path: "/api/abdm/v3/health_id/create/verify_mobile_otp/",
      method: "POST",
      TBody: Type<{
        transaction_id: string;
        otp: string;
      }>(),
      TRes: Type<{
        transaction_id: string;
        detail: string;
      }>(),
    },

    abhaCreateAbhaAddressSuggestion: {
      path: "/api/abdm/v3/health_id/create/abha_address_suggestion/",
      method: "POST",
      TBody: Type<{
        transaction_id: string;
      }>(),
      TRes: Type<{
        transaction_id: string;
        abha_addresses: string[];
      }>(),
    },

    abhaCreateEnrolAbhaAddress: {
      path: "/api/abdm/v3/health_id/create/enrol_abha_address/",
      method: "POST",
      TBody: Type<{
        transaction_id: string;
        abha_address: string;
      }>(),
      TRes: Type<{
        detail?: string;
        transaction_id: string;
        health_id: string;
        preferred_abha_address: string;
        abha_number: AbhaNumberModel;
      }>(),
    },

    linkAbhaNumberAndPatient: {
      path: "/api/abdm/v3/health_id/link_patient/",
      method: "POST",
      TBody: Type<{
        abha_number: string;
        patient: string;
      }>(),
      TRes: Type<{
        detail: string;
      }>(),
    },

    abhaLoginCheckAuthMethods: {
      path: "/api/abdm/v3/health_id/login/check_auth_methods/",
      method: "POST",
      TBody: Type<{
        abha_address: string;
      }>(),
      TRes: Type<{
        abha_number: string;
        auth_methods: string[];
      }>(),
    },

    abhaLoginSendOtp: {
      path: "/api/abdm/v3/health_id/login/send_otp/",
      method: "POST",
      TBody: Type<{
        type: "abha-number" | "abha-address" | "mobile" | "aadhaar";
        value: string;
        otp_system: "abdm" | "aadhaar";
      }>(),
      TRes: Type<{
        transaction_id: string;
        detail: string;
      }>(),
    },

    abhaLoginVerifyOtp: {
      path: "/api/abdm/v3/health_id/login/verify_otp/",
      method: "POST",
      TBody: Type<{
        type: "abha-number" | "abha-address" | "mobile" | "aadhaar";
        otp: string;
        transaction_id: string;
        otp_system: "abdm" | "aadhaar";
      }>(),
      TRes: Type<{
        abha_number: AbhaNumberModel;
        created: boolean;
      }>(),
    },

    getAbhaCard: {
      path: "/api/abdm/v3/health_id/abha_card",
      method: "GET",
      TRes: Type<Blob>(),
    },
  },
} as const;

export default routes;
