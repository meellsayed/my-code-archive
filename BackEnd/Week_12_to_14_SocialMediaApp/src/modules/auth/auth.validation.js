import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const signup = joi
  .object()
  .keys({
    username: generalFields.username.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
  })
  .required();

export const confirmEmail = joi
  .object()
  .keys({
    email: generalFields.email,
    code: generalFields.code,
  })
  .required();

export const login = joi
  .object()
  .keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  })
  .required();

export const resetPassword = joi
  .object()
  .keys({
    newPassword: generalFields.password.required(),
    oldPassword: generalFields.password.required(),
  })
  .required();

export const sendForgetPasswordOTP = joi
  .object()
  .keys({ email: generalFields.email.required() })
  .required();

export const forgetPasswordOTP = joi
  .object()
  .keys({
    otp: generalFields.code.required(),
    email: generalFields.email.required(),
    newPassword: generalFields.password.required(),
    
  })
  .required();
export const confirmLogin = joi
  .object()
  .keys({
    email: generalFields.email,
    otp: generalFields.code,
  })
  .required();