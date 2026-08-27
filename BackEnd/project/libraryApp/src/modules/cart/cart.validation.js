import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const addItem = joi.object().keys({
  id: generalFields._id.required(),
  quantity: joi.number().min(1).default(1),
});
export const decrementItem = joi.object().keys({
  id: generalFields._id.required(),
  quantity: joi.number().default(1),
});
export const getOne = joi.object().keys({
  id: generalFields._id.required(),
});
