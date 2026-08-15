import bcrypt from "bcrypt";

export const generateHash = ({
  plainText = "",
  salt = process.env.SALT || 8,
}) => {
  salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(plainText, salt);
};

export const compareHash = ({ plainText = "", hashValue }) => {
  return bcrypt.compareSync(plainText, hashValue);
};
