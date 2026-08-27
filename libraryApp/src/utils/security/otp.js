import { generateHash } from "./hash.js";

export const generateOTP = ({ size = 6 } = {}) => {
  let min = 1 * 10 ** Number(size - 1);
  let max = 9 * 10 ** Number(size - 1);

  const otp = Math.floor(min + Math.random() * max).toString();
  return otp;
};
