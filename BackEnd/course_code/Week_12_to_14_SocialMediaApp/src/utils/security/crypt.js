import CryptoJS from "crypto-js";

/**
 * @param {{ plainText: string, secretKey: string }} params
 * @returns {string}
 */
export const encrypt = ({plainText, secretKey}) => {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};
/**
 * @param {{ cipherText: string, secretKey: string }} params
 * @returns {string}
 */
export const decrypt = ({cipherText, secretKey}) => {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(CryptoJS.enc.Utf8);
};
 