import jwt from "jsonwebtoken";
import userModel from "../DB/models/User.model.js";
import { asyncHandler } from "../utils/error/error.js";

export const userRoles = {
  user: "User",
  admin: "Admin",
};

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    console.log({ authorization });

    const [bearer, token] = authorization?.split(" ") || [];
    console.log({ bearer, token });

    if (!bearer || !token) {
      // return res.status(400).json({ message: "in-valid token components" });
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
    console.log({ decoded });
    if (!decoded?.id) {
      // return res.status(400).json({ message: "in-valid token payload" });
      return next(new Error("in-valid token payload", { cause: 400 }));
    }

    const user = await userModel.findById(decoded.id);
    console.log({ user });
    if (!user) {
      // return res.status(401).json({ message: "User not found" });
      return next(new Error("User not found", { cause: 401 }));
    }

    req.user = user;
    next();
  });
};

export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {

    console.log({ accessRoles, userRole: req.user.role });
    console.log({ accessRolesss: accessRoles.includes(req.user.role) }); // * using this to check if the user's role is included in the accessRoles array

    if (!accessRoles.includes(req.user.role)) {
      //return res.status(403).json({ message: "Access denied" });
      return next(new Error("Access denied", { cause: 403 }));
    }


    next();
  });
};
