import joi from "joi";
import { Types } from "mongoose";
import { asyncHandler } from "../utils/response/error.response.js";

export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid object id");
};

export const generalFields = {
  _id: joi.string().custom(isValidObjectId),
  username: joi.string().min(2).max(50).trim(),
  email: joi.string().email(),
  phone: joi.string(),
  password: joi.string(),
  // .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmationPassword: joi.string().valid(joi.ref("password")),
  address: joi.string(),
  gender: joi.string(),
  otp: joi
    .string()
    .length(6)
    .pattern(/^[0-9]+$/),
  title: joi.string().min(2).max(50),
  price: joi.number().min(joi.ref("costPrice")),
  costPrice: joi.number(),
  quantity: joi.number().min(0),
  minQuantity: joi.number().min(0),
  pages: joi.number().min(0),
  availableToBorrow: joi.boolean(),
  search: joi.string().min(2),
  category: joi.string().min(2),
  publisher: joi.string().min(2),
  sort: joi.string().min(2),
  page: joi.number().min(1),
  limit: joi.number().min(1),
};

/**
 * @param {import('joi').ObjectSchema} Schema
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export const validation = (Schema) => {
  return (req, res, next) => {
    const inputs = { ...req.query, ...req.body, ...req.params };
    const validationResult = Schema.validate(inputs, { abortEarly: false });
    if (validationResult.error) {
      // return next(new Error(validationResult.error.details, { cause: 400 }));
      return res.status(400).json({
        message: "Validation Error",
        details: validationResult.error.details,
      });
    }
    return next();
  };
};
