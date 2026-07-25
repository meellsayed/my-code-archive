import { userModel } from "../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { successResponse } from "../../../utils/response/success.response.js";
import sendEmailEvent from "../../../utils/event/send.email.event.js";
import { verifyToken } from "../../../utils/security/token.js";
import * as dbService from "../../../DB/db.service.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (await dbService.findOne({model: userModel, filter:{ email }})) {
    return next(new Error("Email Exist", { cause: 409 }));
  }

  const hashPassword = generateHash({ plainText: password });
  const code = Math.floor(10000 + Math.random() * 90000).toString();

  const user =await dbService.create({model:userModel,data:{
    username,
    email,
    password: hashPassword,
    confirmEmailOTP: generateHash({plainText:code}),
  }})

  sendEmailEvent.emit("confirmEmail", { email, code });

  return successResponse({
    res,
    message: "User created successful and please confirm your email",
    status: 201,
    data: user,
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token;

  const decoded = verifyToken({
    token,
    signature: process.env.CONFIRM_EMAIL_TOKEN,
  });

  if (!decoded?.email || !decoded?.confirmEmailOTP) {
    return next(new Error("Invalid Token", { cause: 400 }));
  }
  const user = await dbService.findOne({model: userModel, filter:{ email: decoded.email }});
  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }

  if (!compareHash({plainText:decoded.confirmEmailOTP,hashValue:user.confirmEmailOTP})) {
    return next(new Error("Invalid Confirmation", { cause: 400 }));
  }
  if (user.confirmEmail) {
    return next(new Error("Email Already Confirmed", { cause: 400 }));
  }

  user.confirmEmail = true;
  user.confirmEmailOTP = undefined;
  await user.save();

  return successResponse({
    res,
    message: "Email confirmed successfully",
    status: 200,
    data: {},
  });
});
 