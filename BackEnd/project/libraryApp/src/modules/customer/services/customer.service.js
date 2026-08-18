import { roleTypes, userModel } from "../../../DB/models/User.model.js";
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

  customer.isDeleted = true;
  await customer.save();

  return successResponse({
    res,
    statusCode: 200,
    message: "Customer deleted Done",
  });
});

export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const customer = await dbService.findById({ model: customerModel, id });
  if (!customer) {
    return next(new Error("customer not found", { cause: 404 }));
  }
  return successResponse({ res, data: { customer } });
});

export const getAll = asyncHandler(async (req, res, next) => {
  const { search, gender, type, sort, page = 1, limit = 10 } = req.query;

  let filter = {};
  if (search) {
    filter.$or = [
      {
        username: { $regex: search, $options: "i" },
      },
      {
        phone: { $regex: search, $options: "i" },
      },
      {
        address: { $regex: search, $options: "i" },
      },
    ];
  }

  switch (gender) {
    case "male":
      filter.gender = "male";
      break;
    case "female":
      filter.gender = "female";
      break;
    default:
      break;
  }
  switch (type) {
    case "branch":
      filter.type = customerTypes.branch;
      break;
    case "online":
      filter.type = customerTypes.online;
      break;
    default:
      break;
  }

  const customers = await dbService.find({
    model: customerModel,
    filter,
  });
  const customerCount = await customerModel.countDocuments(filter);
  //   const users = await dbService.find({
  //     model: userModel,
  //     filter: { ...filter, role: roleTypes.customer },
  //   });
  return successResponse({ res, data: { customerCount, customers } });
});

//!==============================================================================
export const getCustomerOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {} = req.query;

  const order = await dbService.find({
    model: orderModel,
    filter: { $or: [{ customer: id }] },
    populate: [
      { path: "customer", select: "name phone" },
      { path: "seller" },
      { path: "items" },
    ],
  });

  return successResponse({ res, data: { order } });
});
