import userModel from "../../../DB/model/User.model.js";
import { asyncHandler } from "../../../util/error/error.js";
import { Decrypt } from "../../../util/security/crypt.js";
import { verifyToken } from "../../../util/security/token.js";
import { successResponse } from "../../../util/response/success.res.js";

export const profile = asyncHandler(async (req, res, next) => {
  const authorization = req.headers?.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : authorization;

  const decoded = /** @type {{ id?: string }} */ (
    verifyToken({ token, signature: process.env.TOKEN_SIGNATURE || "" })
  );

  if (!decoded?.id) {
    return next(new Error("I nvalid or missing token", { cause: 401 }));
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  user.phone = Decrypt({ ciphertext: user.phone });
  return successResponse({ res, message: "Profile fetched successfully", data: { user } });
});
