import { asyncHandler } from "../utils/response/error.response.js";
import { decodedToken, tokenTypes } from "../utils/security/token.js";

export const authentication = (tokenType = "access") => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    req.user = await decodedToken({
      authorization,
      tokenType: tokenType == "access" ?tokenTypes.access:tokenTypes.refresh,
      next,
    }); 
    return next();
  });
};

export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("In-valid Access Role", { cause: 403 }));
    }
    return next();
  });
};
