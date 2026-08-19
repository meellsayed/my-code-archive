import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { filterObject } from "../../../utils/utils.js";
import { roleTypes, userModel } from "../../../DB/models/User.model.js";
import { customerModel } from "../../../DB/models/Customer.model.js";
// import { startSession } from "mongoose";

export const getAll = asyncHandler(async (req, res, next) => {
  const { search, seller, status, type } = req.query;

  let query = {};

  if (search) {
    const [usersId, customersId] = await Promise.all([
      dbService.find({
        model: userModel,
        filter: { username: { $regex: search, $options: "i" } },
        select: "_id",
      }),
      dbService.find({
        model: customerModel,
        filter: { username: { $regex: search, $options: "i" } },
        select: "_id",
      }),
    ]);
    query.customer = { $in: [...usersId, ...customersId] };
  }
  if (seller) {
    const sellersId = await dbService.find({
      model: userModel,
      filter: { username: { $regex: seller, $options: "i" } },
      select: "_id",
    });
    query.seller = { $in: [...sellersId] };
  }
  switch (status) {
    case "new":
      query.status = "new";
      break;
    case "canceled":
      query.status = "canceled";
      break;
    case "delivered":
      query.status = "delivered";
      break;
    case "done":
      query.status = "done";
      break;

    default:
      break;
  }
  switch (type) {
    case "branch":
      query.customerType = "Customer";
      break;
    case "online":
      query.customerType = "User";
      break;
    default:
      break;
  }

  const orders = await dbService.find({
    model: orderModel,
    filter: { ...query, isDeleted: false },
    populate: orderPopulate,
  });
  return successResponse({ res, data: { orders } });
});

export const getOne = asyncHandler(async (req, res, next) => {
  const orders = await dbService.find({
    model: orderModel,
    filter: { isDeleted: false },
    populate: orderPopulate,
  });
  return successResponse({ res, data: { orders } });
});
