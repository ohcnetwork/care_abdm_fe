import {
  AbhaNumberModel,
  ConsentRequestModel,
  CreateConsentTBody,
  HealthFacilityModel,
  HealthInformationModel,
  IcreateHealthFacilityTBody,
  IpartialUpdateHealthFacilityTBody,
} from "./types";

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const CARE_BASE_URL = "https://care-staging-api.ohc.network";
const CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY = "care_token";

async function request<Response>(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${CARE_BASE_URL}/${path}`;

  const defaultHeaders = {
    Authorization: `Bearer ${localStorage.getItem(
      CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY
    )}`,
  };

  const requestInit = {
    ...(options ?? {}),
    headers: {
      ...defaultHeaders,
      ...(options?.headers ?? {}),
    },
  };

  const response = await fetch(url, requestInit);

  // TODO: parse response based on content type
  const data = response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // TODO: implement refresh token logic
    }

    throw new Error(String(data));
  }

  return data as Response;
}

const queryString = (params?: Record<string, string | number | boolean>) => {
  if (!params) {
    return "";
  }

  const paramString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return paramString ? `?${paramString}` : "";
};

const apis = {
  consent: {
    list: async (query?: {
      facility?: string;
      patient?: string;
      ordering?: string;
    }) => {
      return await request<PaginatedResponse<ConsentRequestModel>>(
        "/api/abdm/consent/" + queryString(query)
      );
    },

    create: async (body: CreateConsentTBody) => {
      return await request<ConsentRequestModel>("/api/abdm/consent/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    get: async (id: string) => {
      return await request<ConsentRequestModel>(`/api/abdm/consent/${id}/`);
    },

    checkStatus: async (consentRequest: string) => {
      return await request<{ detail: string }>(
        "/api/abdm/v3/hiu/consent_request_status/",
        {
          method: "POST",
          body: JSON.stringify({ consent_request: consentRequest }),
        }
      );
    },
  },

  healthInformation: {
    get: async (artefactId: string) => {
      return await request<HealthInformationModel>(
        `/api/abdm/health_information/${artefactId}`
      );
    },
  },

  healthFacility: {
    list: async () => {
      return await request<PaginatedResponse<HealthFacilityModel>>(
        "/api/abdm/health_facility/"
      );
    },

    create: async (body: IcreateHealthFacilityTBody) => {
      return await request<HealthFacilityModel>("/api/abdm/health_facility/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    get: async (facilityId: string) => {
      return await request<HealthFacilityModel>(
        `/api/abdm/health_facility/${facilityId}/`
      );
    },

    update: async (facilityId: string, body: IcreateHealthFacilityTBody) => {
      return await request<HealthFacilityModel>(
        `/api/abdm/health_facility/${facilityId}/`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        }
      );
    },

    partialUpdate: async (
      facilityId: string,
      body: IpartialUpdateHealthFacilityTBody
    ) => {
      return await request<HealthFacilityModel>(
        `/api/abdm/health_facility/${facilityId}/`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        }
      );
    },

    registerAsService: async (facilityId: string) => {
      return await request<HealthFacilityModel>(
        `/api/abdm/health_facility/${facilityId}/register_service/`,
        {
          method: "POST",
        }
      );
    },
  },

  abhaNumber: {
    get: async (abhaNumberId: string) => {
      return await request<AbhaNumberModel>(
        `/api/abdm/abha_number/${abhaNumberId}/`
      );
    },

    create: async (body: Partial<AbhaNumberModel>) => {
      return await request<AbhaNumberModel>("/api/abdm/abha_number/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },

  healthId: {
    abhaCreateSendAadhaarOtp: async (body: {
      aadhaar: string;
      transaction_id?: string;
    }) => {
      return await request<{
        transaction_id: string;
        detail: string;
      }>("/api/abdm/v3/health_id/create/send_aadhaar_otp/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    abhaCreateVerifyAadhaarOtp: async (body: {
      transaction_id: string;
      otp: string;
      mobile: string;
    }) => {
      return await request<{
        transaction_id: string;
        detail: string;
        is_new: boolean;
        abha_number: AbhaNumberModel;
      }>("/api/abdm/v3/health_id/create/verify_aadhaar_otp/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    abhaCreateLinkMobileNumber: async (body: {
      transaction_id: string;
      mobile: string;
    }) => {
      return await request<{
        transaction_id: string;
        detail: string;
      }>("/api/abdm/v3/health_id/create/link_mobile_number/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    abhaCreateVerifyMobileNumber: async (body: {
      transaction_id: string;
      otp: string;
    }) => {
      return await request<{
        transaction_id: string;
        detail: string;
      }>("/api/abdm/v3/health_id/create/verify_mobile_otp/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    abhaCreateAbhaAddressSuggestion: async (body: {
      transaction_id: string;
    }) => {
      return await request<{
        transaction_id: string;
        abha_addresses: string[];
      }>("/api/abdm/v3/health_id/create/abha_address_suggestion/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    abhaCreateEnrolAbhaAddress: async (body: {
      transaction_id: string;
      abha_address: string;
    }) => {
      return await request<{
        detail?: string;
        transaction_id: string;
        health_id: string;
        preferred_abha_address: string;
        abha_number: AbhaNumberModel;
      }>("/api/abdm/v3/health_id/create/enrol_abha_address/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    linkAbhaNumberAndPatient: async (body: {
      abha_number: string;
      patient: string;
    }) => {
      return await request<{
        detail: string;
      }>("/api/abdm/v3/health_id/link_patient/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    abhaLoginCheckAuthMethods: async (body: { abha_address: string }) => {
      return await request<{
        abha_number: string;
        auth_methods: string[];
      }>("/api/abdm/v3/health_id/login/check_auth_methods/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    abhaLoginSendOtp: async (body: {
      value: string;
      type: "abha-number" | "abha-address" | "mobile" | "aadhaar";
      otp_system: "abdm" | "aadhaar";
    }) => {
      return await request<{
        transaction_id: string;
        detail: string;
      }>("/api/abdm/v3/health_id/login/send_otp/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    abhaLoginVerifyOtp: async (body: {
      type: "abha-number" | "abha-address" | "mobile" | "aadhaar";
      otp: string;
      transaction_id: string;
      otp_system: "abdm" | "aadhaar";
    }) => {
      return await request<{
        abha_number: AbhaNumberModel;
        created: boolean;
      }>("/api/abdm/v3/health_id/login/verify_otp/", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    getAbhaCard: async (query: { abha_id?: string; type: "pdf" | "png" }) => {
      return await request<Blob>(
        "/api/abdm/v3/health_id/login/get_abha_card/" + queryString(query)
      );
    },
  },
};

export default apis;
