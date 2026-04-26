import type { ErrorCode } from "../constants/errorCodes";

export class ApiError extends Error {
  code: ErrorCode | "NETWORK_ERROR";
  details?: unknown;

  constructor(
    code: ErrorCode | "NETWORK_ERROR",
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}
