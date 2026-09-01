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
import { customerModel } from "../../../DB/models/Customer.model.js";

/**
 * @param {Error & {cause?: number}} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, phone, password } = req.body;

  if (!email && !phone)
    return next(new Error("Enter email or phone", { cause: 400 }));

  let user = undefined;
  let customer = undefined;
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
    customer = await dbService.findOne({
      model: customerModel,
      filter: { phone },
      select: "-password",
    });
  }

  if (!user) {
    if (customer) {
      return next(
        new Error("You are branch customer please signup", { cause: 400 }),
      );
    }
    return next(new Error("Invalid email or phone", { cause: 404 }));
  }

  if (!compareHash({ plainText: password, hashValue: user.password }))
    return next(new Error("Invalid password", { cause: 401 }));

  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  return successResponse({
    res,
    data: {
      refreshToken,
      accessToken,
    },
  });
});
export const forgetPasswordSendOtp = asyncHandler(async (req, res, next) => {
  const { email, newPassword, confirmationNewPassword } = req.body;

  if (newPassword != confirmationNewPassword)
    return next(
      new Error("Password confirmation does not match", { cause: 400 }),
    );

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
  return successResponse({ res, message: "Recovery OTP sent to your email" });
});
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const data = await verifyToken({
    token: token,
    signature: process.env.CONFIRM_FORGET_PASSWORD_SIGNATURE,
  });
  if (
    data.email == undefined ||
    data.otp == undefined ||
    data.newPassword == undefined
  ) {
    return next(new Error("Invalid recovery link", { cause: 400 }));
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: { email: data.email },
  });
  if (!user) return next(new Error("Invalid recovery link", { cause: 400 }));

  if (!compareHash({ plainText: data.otp, hashValue: user.otp }))
    return next(new Error("Invalid OTP", { cause: 400 }));

  user.password = data.newPassword;
  user.otp = undefined;
  user.changeCredentialsTime = Date.now();
  await user.save();
  return successResponse({
    res,
    message: "Password updated successfully",
  });
});
//* not have error look into controller
export const accessToken = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const accessToken = generateAccessToken(user);
  return successResponse({
    res,
    data: { accessToken },
  });
});
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmationNewPassword } = req.body;
  if (!compareHash({ plainText: oldPassword, hashValue: req.user.password }))
    return new Error("Old password error", { cause: 403 });
  req.user.password = oldPassword;
});
//* brach customer login
