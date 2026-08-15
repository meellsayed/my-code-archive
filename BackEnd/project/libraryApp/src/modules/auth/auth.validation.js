import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const signup = joi
  .object()
  .keys({
    username: generalFields.username.required(),
    email: generalFields.email.required(),
    phone: generalFields.phone.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required(),
    address: generalFields.address,
    gender: generalFields.gender,
  })
  .required();

// export const confirmEmail = joi.object().keys({
//   confirmEmailToken: generalFields.token.required(),
// });

export const login = joi
  .object()
  .keys({
    email: generalFields.email,
    phone: generalFields.phone,
    password: generalFields.password.required(),
  })
  .required();

export const forgetPasswordSendOtp = joi.object().keys({
  email: generalFields.email,
  newPassword: generalFields.password.required(),
  confirmationNewPassword: joi.string().valid(joi.ref("newPassword")),
});
