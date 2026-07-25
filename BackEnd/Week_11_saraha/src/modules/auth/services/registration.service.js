import userModel from "../../../DB/models/User.model.js";
import  from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { userRoles } from "../../../middleware/auth.middleware.js";
import { emailEvent } from "../../../utils/event/email.event.js";
import { asyncHandler } from "../../../utils/error/error.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { email, password, confirmationPassword, phone } = req.body;

  if (password !== confirmationPassword) {
    // return res  from
    //   .status(400)
    //   .json({ message: "Password mismatch confirmationPassword" });
    return next(new Error("Password mismatch confirmationPassword"));
  }
  if (password.length < 6) {
    // return res.status(409).json({ message: "Password < 6 char" });
    return next(new Error("Password < 6 char"));
  }
  const checkEmail = await userModel.findOne({ email });
  if (checkEmail) {
    // return res.status(409).json({ message: "Email exist" });
    return next(new Error("Email exist"));
  }

  // const hashPassword = bcrypt.hashSync(password, parseInt(process.env.SALT));
  const encryptPhone = CryptoJS.AES.encrypt(
    phone,
    process.env.PHONE_ENC,
  ).toString();

  // req.body.password = hashPassword;
  req.body.password = generateHash({plainText:password});
  req.body.phone = encryptPhone; 
  req.body.confirmEmail = false;

  const user = await userModel.create(req.body);

  emailEvent.emit("sendConfirmEmail", { email });

  // return res.status(201).send({ message: "User signup successful", user });
  return successResponse({
    res,
    message: "User signup successful",
    data: { user },
    status: 201,
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  const decoded = jwt.verify(authorization, process.env.EMAIL_TOKEN_SIGNATURE);

  const user = await userModel.findOne({ email: decoded.email });
  if (user.confirmEmail) {
    // return res.status(409).json({ message: "Email Confirmed Before", user });
    return next(new Error("Email Confirmed Before", { cause: 409 }));
  }
  
  if (user == null) {
    // return res
    //   .status(404)
    //   .json({ message: "Confirm Email Error ,Email Not Found" });
    return next(
      new Error("Confirm Email Error ,Email Not Found", { cause: 404 }),
    );
  }
  user.confirmEmail = true;

  // return res.status(200).json({ message: "Confirm Email Done", user });
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
    // return res.status(400).json({ message: "In-valid email" });
    return next(new Error("In-valid email"));
  }
  // ! confirm email
  if (!user.confirmEmail) {
    // return res.status(403).json({ message: "This email is not confirm" });
    return next(new Error("This email is not confirm", { cause: 403 }));
  }

  // const checkPassword = bcrypt.compareSync(password, user.password);
  const checkPassword = compareHash({plainText:password,hashValue:user.password})
  if (!checkPassword) {
    // return res.status(400).json({ message: "In-valid password" });
    return next(new Error("In-valid password"));
  }

  // user.phone = CryptoJS.AES.decrypt(user.phone, process.env.PHONE_ENC).toString(CryptoJS.enc.Utf8)
  const token = jwt.sign(
    { id: user._id, isLoggedIn: true },
    user.role == userRoles.admin
      ? process.env.TOKEN_SIGNATURE_ADMIN
      : process.env.TOKEN_SIGNATURE,
  );

  return res
    .status(200)
    .json({ message: "User login successful", user, token, role: user.role });
});
