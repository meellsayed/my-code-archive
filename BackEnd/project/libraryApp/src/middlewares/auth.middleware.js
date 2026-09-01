import { asyncHandler } from "../utils/response/error.response.js";
import { decodedToken, tokenTypes } from "../utils/security/token.js";

/**
 * @param {string} tokenType
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>}
 */
export const authentication = ({ tokenType = "access", type = "" } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (type == "get" && !authorization) return next();

    req.user = await decodedToken({
      authorization,
      tokenType: tokenType == "access" ? tokenTypes.access : tokenTypes.refresh,
    });
    if (req.user == undefined) {
      return next(new Error("Unauthenticated", { cause: 401 }));
    }
    return next();
  });
};

/**
 * @param {string[]} accessRoles
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>}
 */
export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(
        new Error("Access denied: insufficient permissions", { cause: 403 }),
      );
    }
    return next();
  });
};
