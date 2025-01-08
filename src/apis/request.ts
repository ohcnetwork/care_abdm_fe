const CARE_BASE_URL = __CORE_ENV__.REACT_CARE_API_URL || "";
const CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY = "care_access_token";

export class APIError extends Error {
  message: string;
  data: unknown;
  status: number;

  constructor(message: string, data: unknown, status: number) {
    super(message);
    this.message = message;
    this.data = data;
    this.status = status;
  }
}

export async function request<Response>(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${CARE_BASE_URL}/${path}`;

  const defaultHeaders = {
    Authorization: `Bearer ${localStorage.getItem(
      CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY
    )}`,
    "Content-Type": "application/json",
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
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // TODO: implement refresh token logic
    }

    throw new APIError(
      data.detail ?? "Something went wrong",
      data,
      response.status
    );
  }

  return data as Response;
}

export const queryString = (
  params?: Record<string, string | number | boolean>
) => {
  if (!params) {
    return "";
  }

  const paramString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return paramString ? `?${paramString}` : "";
};
