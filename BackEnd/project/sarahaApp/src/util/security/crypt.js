import CryptoJS from "crypto-js";

/**
 * @param {{ text?: string, encryptKey?: string }} [options]
 * @returns {string}
 */
export const generateEncrypt = ({
  text = "",
  encryptKey = process.env.CRYPT_SIGNATURE || "",
} = {}) => {
  return CryptoJS.AES.encrypt(text, encryptKey).toString();
};

/**
 * @param {{ ciphertext?: string, signature?: string }} [options]
 * @returns {string}
 */
export const Decrypt = ({
  ciphertext = "",
  signature = process.env.CRYPT_SIGNATURE || "",
} = {}) => {
  return CryptoJS.AES.decrypt(ciphertext, signature).toString(
    CryptoJS.enc.Utf8,
  );
};
