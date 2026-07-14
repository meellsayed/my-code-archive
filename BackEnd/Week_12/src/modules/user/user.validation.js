import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const shareProfile = joi
  .object()
  .keys({
    profileId: generalFields.id.required(),
  })
  .required();

export const blockUser = joi
  .object()
  .keys({
    profileId: generalFields.email.required(),
  })
  .required();

