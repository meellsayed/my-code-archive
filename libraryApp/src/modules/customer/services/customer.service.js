import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { filterObject } from "../../../utils/utils.js";
import {
  customerModel,
  customerTypes,
} from "../../../DB/models/Customer.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";

export const addOne = asyncHandler(async (req, res, next) => {
  const { username, phone, address, gender, type } = req.body;

  const data = filterObject({
    username,
    phone,
    address,
    gender,
    createdBy: req.user._id,
    type, // if he send message to whatsapp
  });

  const customer = await dbService.create({
    model: customerModel,
    data: { ...data },
  });

  return successResponse({ res, statusCode: 201, data: { customer } });
});
export const deleteOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const customer = await dbService.findById({ model: customerModel, id });

  if (!customer || customer.isDeleted) {
    return next(new Error("Customer not found", { cause: 404 }));
  }

  customer.isDeleted = true;
  await customer.save();

  return successResponse({
    res,
    statusCode: 200,
    message: "Customer deleted successfully",
  });
});
export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const customer = await dbService.findById({ model: customerModel, id });
  if (!customer) {
    return next(new Error("Customer not found", { cause: 404 }));
  }
  return successResponse({ res, data: { customer } });
});
export const getAll = asyncHandler(async (req, res, next) => {
  const { search, gender, type } = req.query;

  let filter = { isDeleted: false };
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  if (gender === "male" || gender === "female") filter.gender = gender;
  if (type && customerTypes[type]) filter.type = customerTypes[type];

  const customers = await dbService.find({
    model: customerModel,
    filter,
    sort: { createdAt: -1 },
  });

  return successResponse({ res, data: { customers } });
});

export const updateOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { username, phone, address, gender, type } = req.body;

  const customer = await dbService.findById({ model: customerModel, id });
  if (!customer || customer.isDeleted) {
    return next(new Error("Customer not found", { cause: 404 }));
  }

  const data = filterObject({ username, phone, address, gender, type });
  const updated = await dbService.findByIdAndUpdate({
    model: customerModel,
    id,
    data,
    options: { new: true },
  });

  return successResponse({ res, data: { customer: updated } });
});
