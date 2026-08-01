import jwt from "jsonwebtoken";
import userModel from "../DB/model/User.model.js";
import { asyncHandler } from "../util/error/error.js";

export const userRoles = {
  user: "User",
  admin: "Admin",
};

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const [bearer, token] = authorization?.split(" ") || [];

    if (!bearer || !token) {
      return next(new Error("in-valid token components", { cause: 400 }));
    }

    let signature = undefined;
    switch (bearer) {
      case "Admin":
        signature = process.env.TOKEN_SIGNATURE_ADMIN;
        break;
      case "Bearer":
        signature = process.env.TOKEN_SIGNATURE;
        break;
      default:
        break;
    }

    const decoded = jwt.verify(token, signature);

    if (!decoded?.id) {
      return next(new Error("in-valid token payload", { cause: 400 }));
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new Error("User not found", { cause: 401 }));
    }

    // console.log({ decoded });
    // console.log({ user });
    // console.log({ bearer, token });
    // console.log({ authorization });

    req.user = user;
    next();
  });
};

export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Access denied", { cause: 403 }));
    }
    next();
  });
};
