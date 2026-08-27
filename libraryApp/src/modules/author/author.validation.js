import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const getAuthorBooks = joi.object().keys({
  id: generalFields._id.required(),
  search: generalFields.search,
  sort: generalFields.sort,
  page: generalFields.page,
  limit: generalFields.limit,
});
export const getAll = joi.object().keys({
  search: generalFields.search,
  sort: generalFields.sort,
  page: generalFields.page,
  limit: generalFields.limit,
});
export const addOne = joi.object().keys({
  name: generalFields.username.required(),
  bio: joi.string().min(5).max(500),
  birthDate: joi.date().max("now"),
  deathDate: joi.date().max("now").greater(joi.ref("birthDate")).allow(null),
});
export const updateOne = joi.object().keys({
  id: generalFields._id.required(),
  name: generalFields.username,
  bio: joi.string().min(5).max(500),
  birthDate: joi.date().max("now"),
  deathDate: joi.date().max("now").greater(joi.ref("birthDate")).allow(null),
});
export const deleteOne = joi.object().keys({
  id: generalFields._id.required(),
});
