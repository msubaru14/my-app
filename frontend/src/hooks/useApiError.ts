import { ERROR_CODES } from "../constants/errorCodes";
import {
  ERROR_MESSAGES,
  GENERIC_ERROR_MESSAGE,
} from "../constants/errorMessages";
import { ApiError } from "../lib/errors";
import type { ValidationDetail } from "../lib/errors";

export type ApiErrorResult =
  | { type: "redirect"; to: string }
  | { type: "validation"; details: ValidationDetail[]; message: string }
  | { type: "message"; message: string };

const resolveMessage = (error: ApiError) => {
  return ERROR_MESSAGES[error.code] ?? error.message ?? GENERIC_ERROR_MESSAGE;
};

const resolveError = (error: unknown): ApiErrorResult => {
  if (!(error instanceof ApiError)) {
    return { type: "message", message: GENERIC_ERROR_MESSAGE };
  }

  switch (error.code) {
    case ERROR_CODES.UNAUTHORIZED:
      return { type: "redirect", to: "/login" };
    case ERROR_CODES.VALIDATION_ERROR: {
      const details = error.details;
      return {
        type: "validation",
        details,
        message: details.map((detail) => detail.message).join("\n"),
      };
    }
    default:
      return { type: "message", message: resolveMessage(error) };
  }
};

export const useApiError = () => {
  return { resolveError };
};
