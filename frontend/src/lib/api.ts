import { ERROR_CODES } from "../constants/errorCodes";
import type { ErrorCode } from "../constants/errorCodes";
import { CLIENT_ERROR_CODES, ApiError } from "./errors";

export const API_BASE_URL = "http://localhost:8080";

export const getToken = () => localStorage.getItem("token");

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const isErrorCode = (value: unknown): value is ErrorCode => {
  return (
    typeof value === "string" &&
    Object.values(ERROR_CODES).includes(value as ErrorCode)
  );
};

const parseJsonOrThrow = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, "Invalid response format");
  }
};

export const requestJson = async (url: string, init?: RequestInit) => {
  let res: Response;

  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError(CLIENT_ERROR_CODES.NETWORK_ERROR, "Network error");
  }

  const json = await parseJsonOrThrow(res);

  if (json?.error) {
    const code = isErrorCode(json.error.code)
      ? json.error.code
      : ERROR_CODES.INTERNAL_ERROR;
    const message =
      typeof json.error.message === "string" ? json.error.message : code;

    throw new ApiError(code, message, json.error.details);
  }

  if (!res.ok) {
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, "Request failed");
  }

  return json;
};
