import userModel from "../../../DB/model/User.model.js";
import { compareHash, generateHash } from "../../../util/security/hash.js";
import { generateEncrypt } from "../../../util/security/crypt.js";
import { asyncHandler } from "../../../util/error/error.js";
import { successResponse } from "../../../util/response/success.res.js";
import { emailEvent } from "../../../util/event/email.confirm.js";
import { generateToken, verifyToken } from "../../../util/security/token.js";

export const signup = asyncHandler(async (req, res, next) => {
  // const {username,email,password,confirmationPassword,gender,DOB,address}
  const reqData = req.body;

  if (await userModel.findOne({ email: reqData.email })) {
    return next(new Error("Email exist", { cause: 409 }));
  }

  reqData.password = await generateHash({ plainText: reqData.password });
  reqData.phone = await  generateEncrypt({
    text: reqData.phone,
    encryptKey: process.env.ENC_PHONE,
  });
  reqData.confirmEmail = false;

  const user = await userModel.create(reqData);

  emailEvent.emit("sendConfirmEmail", {
    email: reqData.email,
  });

  return successResponse({
    res,
    message: "User signup successful",
    data: { user },
    status: 201,
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  const decoded = verifyToken({
    token: authorization,
    signature: process.env.TOKEN_SIGNATURE,
  });
  if (!decoded) {
    return next(new Error("Invalid Token", { cause: 400 }));
  }

  const user = await userModel.findOne({ email: decoded.email });
  if (user.confirmEmail) {
    return next(new Error("Email Confirmed Before", { cause: 409 }));
  }

  if (user == null) {
    return next(new Error("Email Not Found", { cause: 404 }));
  }

  user.confirmEmail = true;

  return successResponse({
    res,
    message: "Confirm Email Done",
    data: { user },
    status: 200,
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new Error("In-valid email or password", { cause: 400 }));
  }

  const checkPassword = await compareHash({
    plainText: password,
    hashValue: user.password,
  });
  if (!checkPassword) {
    return next(new Error("In-valid email or password", { cause: 400 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please Confirm Your Email", { cause: 400 }));
  }

  const token = generateToken({
    payload: { id: user._id, isLoggedIn: true },
    signature: process.env.TOKEN_SIGNATURE,
    expiresIn: 60 * 60 * 24,
  });
  return successResponse({ res, data: { token } });
});
