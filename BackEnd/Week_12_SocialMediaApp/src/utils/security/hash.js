import bcrypt from "bcrypt";

export const generateHash = ({plainText = "", salt = process.env.SALT}={}) => {
 return bcrypt.hashSync(plainText,parseInt(salt))
};

export const compareHash = ({plainText="",hashValue=""}={}) => {
  return bcrypt.compareSync(plainText,hashValue)
};
