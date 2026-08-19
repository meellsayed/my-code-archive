import jwt from "jsonwebtoken";
import * as dbService from "../../DB/db.service.js";
import { userModel } from "../../DB/models/User.model.js";

export const tokenTypes = {
  access: "access",
  refresh: "refresh",
};

export const generateToken = ({
  payload = {},
  signature = process.env.DEFAULT_SIGNATURE || "!@#$%^&*",
  expiresIn = 1800,
  options = {},
}) => {
  const signOptions = {
    ...options,
    ...(expiresIn !== undefined ? { expiresIn: parseInt(expiresIn) } : {}),
  };
  return jwt.sign(payload, signature, signOptions);
};

export const verifyToken = ({
  token = "",
  signature = process.env.DEFAULT_SIGNATURE || "",
}) => {
  return jwt.verify(token, signature);
};

export const generateRefreshToken = (user = {}) => {
  const payload = { id: user._id, email: user.email, role: user.role };
  const signature = process.env.USER_REFRESH_TOKEN;
  const expiresIn = 31536000;

  return generateToken({ payload, signature, expiresIn });
};

export const generateAccessToken = (user = {}) => {
  const payload = { id: user._id, email: user.email };
  const signature = process.env.USER_ACCESS_TOKEN;
  const expiresIn = process.env.MOOD == "DEV" ? 31536000 : 18000;

  return generateToken({ payload, signature, expiresIn });
};

export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypes.access,
} = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    throw new Error("Missing token", { cause: 400 });
  }

  let refresh_signature = "";
  let access_signature = "";

  switch (bearer) {
    case "Admin":
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
    throw new Error("Invalid token payload", { cause: 401 });
  }
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }
  if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
    throw new Error("Invalid login credentials", { cause: 400 });
  }

  return user;
};
