import { ERROR_CODES } from "../constants/errorCodes";
import { ApiError } from "../lib/errors";

export type ApiErrorResult =
  | { type: "redirect"; to: string }
  | { type: "validation"; details: unknown }
  | { type: "message"; message: string };

const resolveError = (error: unknown): ApiErrorResult => {
  if (!(error instanceof ApiError)) {
    return { type: "message", message: "エラーが発生しました" };
  }

  switch (error.code) {
    case ERROR_CODES.UNAUTHORIZED:
      return { type: "redirect", to: "/login" };
    case ERROR_CODES.VALIDATION_ERROR:
      return { type: "validation", details: error.details };
    case "NETWORK_ERROR":
      return { type: "message", message: "通信エラーが発生しました" };
    default:
      return { type: "message", message: "エラーが発生しました" };
  }
};

export const useApiError = () => {
  return { resolveError };
};
