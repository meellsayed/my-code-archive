import { asyncHandler } from "../../utils/response/error.response.js";
import { decodedToken, tokenTypes } from "../../utils/security/token.js";

/**
 * @param {{ tokenType?: string, socket?: import('socket.io').Socket }} params
 * @returns {Promise<object>}
 */
export const authentication = async ({
  tokenType = "access",
  socket = {},
  next = {},
}) => {
  const token = socket.handshake.auth.authorization
 // console.log({token});
  
  const user = await decodedToken({
    authorization: token,
    tokenType: tokenType == "access" ? tokenTypes.access : tokenTypes.refresh,
    next,
  });

  return user;
};
