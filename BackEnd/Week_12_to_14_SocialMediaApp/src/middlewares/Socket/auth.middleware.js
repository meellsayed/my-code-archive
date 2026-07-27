import { asyncHandler } from "../../utils/response/error.response.js";
import { decodedToken, tokenTypes } from "../../utils/security/token.js";

/**
 * @param {{ tokenType?: string, socket?: import('socket.io').Socket }} params
 * @returns {Promise<object>}
 */
export const authentication = async ({ tokenType = "access", socket = {} }) => {
  let authorization = socket.handshake.auth.authorization;
  const user = await decodedToken({
    authorization,
    tokenType: tokenType == "access" ? tokenTypes.access : tokenTypes.refresh,
  });

  return user;
};

// export const authorization = (accessRoles = []) => {

//     if (!accessRoles.includes(req.user.role)) {
//       return next(new Error("In-valid Access Role", { cause: 403 }));
//     }
//     return next();

// };
