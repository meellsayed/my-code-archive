import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const getAll = joi.object().keys({
  search: generalFields.search,
  sort: generalFields.sort,
  page: generalFields.page,
  limit: generalFields.limit,
});

export const addOne = joi.object().keys({
  name: generalFields.username.required(),
  description: joi.string().min(5).max(500),
});
export const updateOne = joi.object().keys({
  id: generalFields._id.required(),
  name: generalFields.username,
  description: joi.string().min(5).max(500),
});
export const deleteOne = joi.object().keys({
  id: generalFields._id.required(),
});

export const getCategoryBooks = joi.object().keys({
  id: generalFields._id.required(),
});
export const getOne = joi.object().keys({
  id: generalFields._id.required(),
});
