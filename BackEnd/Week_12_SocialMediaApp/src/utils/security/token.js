import jwt from "jsonwebtoken";
import { userModel } from "../../DB/models/User.model.js";
import * as dbService from "../../DB/db.service.js";
/**
 * @param {{ payload?: object, signature?: string, options?: import('jsonwebtoken').SignOptions, expiresIn?: string|number }} [args]}
 * @returns {string}
 *
 */

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};
export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypes.access,
  next = {},
} = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    return next(new Error("Missing token", { cause: 400 }));
  }

  let refresh_signature = "";
  let access_signature = "";

  switch (bearer) {
    case "System":
      refresh_signature = process.env.ADMIN_REFRESH_TOKEN;
      access_signature = process.env.ADMIN_ACCESS_TOKEN;
      break;
    case "Bearer":
      refresh_signature = process.env.USER_REFRESH_TOKEN;
      access_signature = process.env.USER_ACCESS_TOKEN;
      break;
    default:
      break;
  }

  const decoded = verifyToken({
    token,
    signature:
      tokenType == tokenTypes.access ? access_signature : refresh_signature,
  });
  if (!decoded?.id) {
    return next(new Error("In-valid token payload", { cause: 401 }));
  }
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id, isDeleted: false },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
    return next(new Error("In-valid login Credentials", { cause: 400 }));
  }

  return user
};


export const generateToken = ({
  payload = {},
  signature = process.env.TOKEN_SIGNATURE,
  options = {},
  expiresIn = 60,
} = {}) => {
  
  if (!signature) {
    throw new Error("Missing TOKEN_SIGNATURE");
  }
  const signOptions = {
    ...options,
    ...(expiresIn !== undefined ? { expiresIn: parseInt(expiresIn) } : {}),
  };
  return jwt.sign(payload, signature, signOptions);
};

/**
 * @param {{ token?: string, signature?: string }} [args]
 * @returns {string | object}
 */
export const verifyToken = ({
  token = "",
  signature = process.env.TOKEN_SIGNATURE,
} = {}) => {

  if (!signature) {
    throw new Error("Missing TOKEN_SIGNATURE");
  }
  return jwt.verify(token, signature);
};
