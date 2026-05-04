import { ERROR_CODES } from "./errorCodes";
import { CLIENT_ERROR_CODES } from "../lib/errors";
import type { AppErrorCode } from "../lib/errors";

export const GENERIC_ERROR_MESSAGE = "エラーが発生しました";

export const ERROR_MESSAGES: Partial<Record<AppErrorCode, string>> = {
  [CLIENT_ERROR_CODES.NETWORK_ERROR]: "通信エラーが発生しました",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: GENERIC_ERROR_MESSAGE,
};
