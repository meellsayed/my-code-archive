import joi from "joi";
import { Types } from "mongoose";

export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)?true : helper.message("In-valid object Id")
};

export const generalFields = {
  username: joi.string().min(2).max(50).trim(),
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 3,
      tlds: { allow: ["com", "net"] },
    }),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
  confirmationPassword: joi.string().valid(joi.ref("password")),
  code: joi
    .string()
    .length(5)
    .pattern(/^[0-9]+$/),
  id: joi.string().custom(isValidObjectId),
};

export const validation = (Schema) => {
  return (req, res, next) => {
    const inputs = { ...req.query, ...req.body, ...req.params };
    const validationResult = Schema.validate(inputs, { abortEarly: false });
    if (validationResult.error) {
      // return next(new Error(validationResult.error.details))
      return res
        .status(400)
        .json({
          message: "Validation Error",
          details: validationResult.error.details,
        });
    }
    return next();
  };
};
