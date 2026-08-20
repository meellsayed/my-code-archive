import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/models/User.model.js";
import sendEmailEvent, {
  sendEmailEventType,
} from "../../../utils/events/sendEmail.event.js";
import { verifyToken } from "../../../utils/security/token.js";
import { generateOTP } from "../../../utils/security/otp.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { filterObject } from "../../../utils/utils.js";
import {
  customerModel,
  customerTypes,
} from "../../../DB/models/Customer.model.js";

/**
 * @param {Error & {cause?: number}} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const signup = asyncHandler(async (req, res, next) => {
  const {
    username,
    email,
    phone,
    password,
    confirmationPassword,
    address,
    gender,
  } = req.body;

  if (
    await dbService.findOne({
      model: userModel,
      filter: { $or: [{ email }, { phone }] },
    })
  ) {
    return next(new Error("Email or phone already exists", { cause: 400 }));
  }
  const data = filterObject({
    username,
    email,
    password,
    phone,
    address,
    gender,
  });

  const otp = await generateOTP();

  const user = await dbService.create({
    model: userModel,
    data: {
      ...data,
      otp: generateHash({ plainText: otp }),
    },
  });

  // Link the new account to a Customer record (reuse by phone if exists)
  let message = "Account created successfully";
  let customer = await dbService.findOne({
    model: customerModel,
    filter: { phone },
  });
  if (customer) {
    customer.type = customerTypes.onlineAndBranch;
    message = "Welcome back branch customer";
    await customer.save();
  }

  sendEmailEvent.emit(sendEmailEventType.confirmEmail, {
    _id: user._id,
    email,
    otp,
  });

  return successResponse({ res, message, data: { user }, statusCode: 201 });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { confirmEmailToken } = req.params;

  const decoded = verifyToken({
    token: confirmEmailToken,
    signature: process.env.CONFIRM_EMAIL_SIGNATURE,
  });

  const user = await dbService.findById({
    model: userModel,
    id: decoded._id,
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (user.confirmEmail == true) {
    return next(new Error("Email is already confirmed", { cause: 400 }));
  }
  if (!compareHash({ plainText: decoded.otp, hashValue: user.otp })) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  user.confirmEmail = true;
  user.otp = undefined;
  await user.save();
  return successResponse({
    res,
    data: {},
    message: "Email confirmed successfully",
  });
});
