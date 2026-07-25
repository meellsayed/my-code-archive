import CryptoJS from "crypto-js";

export const encrypt = ({plainText, secretKey}) => {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};
export const decrypt = ({cipherText, secretKey}) => {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(CryptoJS.enc.Utf8);
};
 