import jwt from "jsonwebtoken";

/**
 * @param {{ payload?: object, signature?: string, options?: import('jsonwebtoken').SignOptions, expiresIn?: string|number }} [args]
 * @returns {string}
 */
export const generateToken = ({
  payload = {},
  signature = process.env.TOKEN_SIGNATURE,
  options = {},
  expiresIn,
} = {}) => {
  const secret = signature || process.env.TOKEN_SIGNATURE;
  if (!secret) {
    throw new Error("Missing TOKEN_SIGNATURE");
  }
  const signOptions = {
    ...options,
    ...(expiresIn !== undefined ? { expiresIn } : {}),
  };
  return jwt.sign(payload, secret, signOptions);
};

/**
 * @param {{ token?: string, signature?: string }} [args]
 * @returns {string | object}
 */
export const verifyToken = ({
  token = "",
  signature = process.env.TOKEN_SIGNATURE,
} = {}) => {
  const secret = signature || process.env.TOKEN_SIGNATURE;
  if (!secret) {
    throw new Error("Missing TOKEN_SIGNATURE");
  }
  return jwt.verify(token, secret);
};
