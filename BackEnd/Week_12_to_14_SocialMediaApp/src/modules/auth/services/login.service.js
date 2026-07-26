import { roleTypes, userModel } from "../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  generate_access_token,
  generate_refresh_token,
} from "../../../utils/security/token.js";
import sendEmailEvent from "../../../utils/event/send.email.event.js";
import * as dbService from "../../../DB/db.service.js";

/**
 *  @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 */

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({ model: userModel, filter: { email } });

  if (!user) {
    return next(new Error("In-valid Email Or Password", { cause: 404 }));
  }
  if (!compareHash({ plainText: password, hashValue: user.password })) {
    return next(new Error("In-valid Email Or Password", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Pleas verify your account first", { cause: 400 }));
  }

  if (user.isTwoStepVerification) {
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    user.loginConfirmationOTP = generateHash({ plainText: otp });
    user.OTPExpiresIn = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    sendEmailEvent.emit("loginConfirmationOTP", {
      email: user.email,
      username: user.username,
      otp,
    });
    return successResponse({
      res,
      message: "User login 2 step verification check your email",
    });
  }

  const access_token = generate_access_token(user);
  const refresh_token = generate_refresh_token(user);

  // sendEmailEvent.emit("emailLoginAlert", { email });

  return successResponse({
    res,
    data: {
      message: "Done",
      id: user._id,
      token: { access_token, refresh_token },
    },
  });
});

export const loginConfirmation = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await dbService.findOne({ model: userModel, filter: { email } });

  if (!user) {
    return next(new Error("In-valid Email", { cause: 404 }));
  }
  if (new Date() > user.OTPExpiresIn) {
    user.loginConfirmationOTP = undefined;
    user.OTPExpiresIn = undefined;
    await user.save();
    return next(new Error("OTP has expired", { cause: 400 }));
  }
  if (!compareHash({ plainText: otp, hashValue: user.loginConfirmationOTP })) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }
  user.loginConfirmationOTP = undefined;
  user.OTPExpiresIn = undefined;
  await user.save();

  const access_token = generate_access_token(user);
  const refresh_token = generate_refresh_token(user);

  return successResponse({
    res,
    message: "User login successful",
    data: { id: user._id, token: { access_token, refresh_token } },
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const access_token = generate_access_token(user);
  return successResponse({
    res,
    message: "Done",
    data: { token: { access_token } },
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  let user = req.user;
  if (oldPassword == newPassword) {
    return next(new Error("oldPassword = newPassword"));
  }
  if (!compareHash({ plainText: oldPassword, hashValue: user.password })) {
    return next(new Error("In-valid old password", { cause: 409 }));
  }

  user.changeCredentialsTime = Date.now() - 3000;
  user.password = generateHash({ plainText: newPassword });

  req.user = user;
  await req.user.save();

  const access_token = generate_access_token(user);
  const refresh_token = generate_refresh_token(user);

  res.json({
    message: "User Password Reset",
    data: { user: user, token: { access_token, refresh_token } },
  });
});

export const sendForgetPasswordOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  let user = await dbService.findOne({
    model: userModel,
    filter: { email, isDeleted: false },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  user.forgetPasswordOTP = generateHash({ plainText: otp });
  user.OTPExpiresIn = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  sendEmailEvent.emit("otpForgetPassword", { email: user.email, otp });

  return successResponse({ res });
});

export const forgetPasswordOTP = asyncHandler(async (req, res, next) => {
  const { otp, email, newPassword } = req.body;

  let user = await dbService.findOne({
    model: userModel,
    filter: { email, isDeleted: false },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (new Date() > user.OTPExpiresIn) {
    user.forgetPasswordOTP = undefined;
    user.OTPExpiresIn = undefined;
    await user.save();
    return next(new Error("OTP has expired", { cause: 400 }));
  }
  if (!compareHash({ plainText: otp, hashValue: user.forgetPasswordOTP })) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }
  user.OTPExpiresIn = undefined;
  user.forgetPasswordOTP = undefined;
  user.password = generateHash({ plainText: newPassword });
  user.changeCredentialsTime = Date.now();
  await user.save();
  return successResponse({
    res,
    message: "Password reset successfully",
    status: 200,
    data: { user },
  });
});

export const enable2faSendOTP = asyncHandler(async (req, res, next) => {
  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  req.user.enable2faOTP = generateHash({ plainText: otp });
  req.user.OTPExpiresIn = new Date(Date.now() + 5 * 60 * 1000);
  await req.user.save();

  sendEmailEvent.emit("enable2faSendOTP", { email: req.user.email, otp });

  return successResponse({
    res,
    message: `Enable 2fa Send OTP To Email ${otp}`,
  });
});

export const enable2faConfirmOTP = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  if (new Date() > req.user.OTPExpiresIn) {
    req.user.forgetPasswordOTP = undefined;
    req.user.OTPExpiresIn = undefined;
    await req.user.save();
    return next(new Error("OTP has expired", { cause: 400 }));
  }
  if (!compareHash({ plainText: otp, hashValue: req.user.enable2faOTP })) {
    return next(new Error("In-valid OTP", { cause: 400 }));
  }
  req.user.OTPExpiresIn = undefined;
  req.user.enable2faOTP = undefined;
  req.user.isTwoStepVerification = true;
  await req.user.save();

  return successResponse({ res, message: "Two Step Verification True" });
});
