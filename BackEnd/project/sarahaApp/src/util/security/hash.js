import bcrypt from "bcrypt";

export const generateHash = ({
  plainText = "",
  salt = process.env.SALT,
} = {}) => {
  const hash = bcrypt.hashSync(plainText, parseInt(salt));
  return hash;
};

export const compareHash = ({ plainText = "", hashValue = "" }) => {
  const compare = bcrypt.compareSync(plainText, hashValue);
  return compare;
};
 