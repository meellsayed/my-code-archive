import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/models/User.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../../utils/security/token.js";
import sendEmailEvent, {
  sendEmailEventType,
} from "../../../utils/events/sendEmail.event.js";
import { generateOTP } from "../../../utils/security/otp.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";

/**
 * @param {Error & {cause?: number}} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

export const login = asyncHandler(async (req, res, next) => {
  const { email, phone, password } = req.body;

  if (!email && !phone) return next(new Error("Enter email or password !!"));

  let user = undefined;
  if (email) {
    user = await dbService.findOne({
      model: userModel,
      filter: { email, isDeleted: false },
    });
  } else if (phone) {
    user = await dbService.findOne({
      model: userModel,
      filter: { phone, isDeleted: false },
    });
  }

  if (user == undefined)
    return next(new Error("In-valid email or phone", { cause: 404 }));

  if (!compareHash({ plainText: password, hashValue: user.password }))
    return next(new Error("In-valid password"));

  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  return successResponse({
    res,
    data: {
      refreshToken,
      accessToken,
      user
    },
  });
});

export const forgetPasswordSendOtp = asyncHandler(async (req, res, next) => {
  const { email, newPassword, confirmationNewPassword } = req.body;

  if (newPassword != confirmationNewPassword)
    return next(new Error("Password not matched"));

  const user = await dbService.findOne({
    model: userModel,
    filter: { email },
  });

  if (!user) return next(new Error("Email not found", { cause: 404 }));

  const otp = generateOTP();

  user.otp = generateHash({ plainText: otp });
  await user.save();

  sendEmailEvent.emit(sendEmailEventType.sendForgetPasswordOTP, {
    email,
    otp,
    newPassword,
  });
  return successResponse({ res, message: "Done" });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { forgetPasswordToken } = req.params;

  const data = await verifyToken({
    token: forgetPasswordToken,
    signature: process.env.CONFIRM_FORGET_PASSWORD_SIGNATURE,
  });
  if (
    data.email == undefined ||
    data.otp == undefined ||
    data.newPassword == undefined
  ) {
    return next(new Error("In-valid"));
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: { email: data.email },
  });
  if (!user) return next(new Error("In-valid"));

  if (!compareHash({ plainText: data.otp, hashValue: user.otp }))
    return next(new Error("In-valid otp"));

  user.password = data.newPassword;
  user.otp = undefined 
  user.changeCredentialsTime = Date.now();
  await user.save();
  return successResponse({ res, data: { user }, message: "Done" });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const accessToken = generateAccessToken(user);
  return successResponse({
    res,
    data: { accessToken, userId: user._id, username: user.username },
  });
});


//* brach customer login
