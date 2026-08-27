import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const getAll = joi.object().keys({
  search: generalFields.search,
  category: generalFields.category,
  publisher: generalFields.publisher,
  sort: generalFields.sort,
  page: generalFields.page,
  limit: generalFields.limit,
});
export const getOne = joi.object().keys({
  id: generalFields._id.required(),
});
export const addOne = joi.object().keys({
  title: generalFields.title.required(),
  price: generalFields.price.required(),
  costPrice: generalFields.costPrice.required(),
  subtitle: generalFields.title,
  description: joi.string(),
  quantity: generalFields.quantity.required(),
  minQuantity: generalFields.minQuantity.default(1),
  pages: generalFields.pages,
  availableToBorrow: generalFields.availableToBorrow.default(true),
  author: generalFields._id.required().allow(null),
  categories: [generalFields._id.required().allow(null)],
});
export const updateOne = joi.object().keys({
  id: generalFields._id.required(),
  title: generalFields.title,
  price: generalFields.price,
  costPrice: generalFields.costPrice,
  subtitle: generalFields.title,
  description: joi.string(),
  quantity: generalFields.quantity,
  minQuantity: generalFields.minQuantity.default(1),
  pages: generalFields.pages,
  availableToBorrow: generalFields.availableToBorrow.default(true),
  author: generalFields._id.allow(null),
  categories: [generalFields._id.allow(null)],
});
export const deleteOne = joi.object().keys({
  id: generalFields._id.required(),
});
export const cover = joi.object().keys({
  id: generalFields._id,
});
