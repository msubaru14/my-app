import type { ErrorCode } from "../constants/errorCodes";

type ClientErrorCode = "NETWORK_ERROR";

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
