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

  if (await dbService.findOne({ model: userModel, filter: { $or: [{email},{phone}] } })) {
    return next(new Error("Email exist", { cause: 400 }));
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
  // const customer = await dbService.findOneAndUpdate({
  //   model: customerModel,
  //   filter: { phone },
  //   data: { type: customerTypes.onlineAndBranch, ...data, user: user._id },
  // });
  // let message = "";
  // if (customer) {
  //   message = "Welcome back branch friend";
  // }
  // if (!customer) {
  //   customer = await dbService.create({
  //     model: customerModel,
  //     data: { type: customerTypes.online, ...data, user: user._id },
  //   });
  //   message = "Welcome";
  // }

  sendEmailEvent.emit(sendEmailEventType.confirmEmail, {
    _id: user._id,
    email,
    otp,
  });

  return successResponse({ res, data: { user }, statusCode: 201 });
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
    return next(new Error("Email confirm already"));
  }
  if (!compareHash({ plainText: decoded.otp, hashValue: user.otp })) {
    return next(new Error("Otp not matched"));
  }

  user.confirmEmail = true;
  user.otp = undefined;
  await user.save();
  return successResponse({ res, data: {}, message: "Email confirmation done" });
});
