import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const updateProfile = joi.object().keys({
  username: generalFields.username,
  phone: generalFields.phone,
  address: generalFields.address,
  gender: generalFields.gender,
});
