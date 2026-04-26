import type { ErrorCode } from "../constants/errorCodes";

export const CLIENT_ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export type ClientErrorCode =
  (typeof CLIENT_ERROR_CODES)[keyof typeof CLIENT_ERROR_CODES];

export type AppErrorCode = ErrorCode | ClientErrorCode;

export class ApiError extends Error {
  code: AppErrorCode;
  details?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}
