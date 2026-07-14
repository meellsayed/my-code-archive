import CryptoJS from "crypto-js";

export const generateEncryption = ({
  plainText = "",
  key = process.env.KEY,
} = {}) => {
  const hash = CryptoJS.AES.encrypt(plainText,key)
  return hash;
};

export const compareHash = ({ plainText = "", hashValue = "" } = {}) => {
  const isMatch = bcrypt.compareSync(plainText, hashValue);
  return isMatch;
};
