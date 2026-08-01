import bcrypt from "bcrypt";

/**
 * @param {{ plainText?: string, salt?: string }} params
 * @returns {string}
 */
export const generateHash = ({plainText = "", salt = process.env.SALT}={}) => {
 return bcrypt.hashSync(plainText,parseInt(salt))
};

/**
 * @param {{ plainText?: string, hashValue?: string }} params
 * @returns {boolean}
 */
export const compareHash = ({plainText="",hashValue=""}={}) => {
  return bcrypt.compareSync(plainText,hashValue)
};
