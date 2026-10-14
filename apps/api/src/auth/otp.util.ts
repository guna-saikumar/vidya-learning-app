/**
 * OTP helpers — reserved for a future **admin** password-reset / invite flow.
 * Student self-serve register / forgot-password OTP was removed on purpose.
 */
import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_LENGTH = 6;

export const generateOtp = (): string => {
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(0, max)).padStart(OTP_LENGTH, "0");
};

export const hashOtp = async (otp: string): Promise<string> =>
  bcrypt.hash(otp, 10);

export const verifyOtp = async (
  otp: string,
  otpHash: string | null | undefined
): Promise<boolean> => {
  if (!otpHash) return false;
  return bcrypt.compare(otp, otpHash);
};
