import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { filterObject } from "../../../utils/utils.js";
import { roleTypes, userModel } from "../../../DB/models/User.model.js";
import { customerModel } from "../../../DB/models/Customer.model.js";
// import { startSession } from "mongoose";
const orderPopulate = [
  { path: "customer", select: "username phone address type gender" },
  { path: "cart" },
];

export const getAll = asyncHandler(async (req, res, next) => {
  const { search, seller, status, type } = req.query;
  // search customer and users orders

  let query = {};

  if (search) {
    const [usersId, customersId] = await Promise.all([
      dbService.find({
        model: userModel,
        filter: {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        },
        select: "_id",
      }),
      dbService.find({
        model: customerModel,
        filter: {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        },
        select: "_id",
      }),
    ]);

    if (type == "online") {
      query.customer = { $in: [...usersId] };
      query.customerType = "User";
    } else if (type == "branch") {
      query.customer = { $in: [...customersId] };
      query.customerType = "Customer";
    } else {
      query.customer = { $in: [...usersId, ...customersId] };
    }
  }
  if (seller) {
    const sellersId = await dbService.find({
      model: userModel,
      filter: {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      },
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

  const orders = await dbService.find({
    model: orderModel,
    filter: { ...query },
    populate: orderPopulate,
  });
  return successResponse({ res, data: { orders } });
});

export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // id order
  const orders = await dbService.find({
    model: orderModel,
    filter: { isDeleted: false },
    populate: orderPopulate,
  });
  return successResponse({ res, data: { orders } });
});

export const getCustomerOrders = asyncHandler(async (req, res, next) => {
  const { id } = req.params; //customer id

  const orders = await dbService.find({
    model: orderModel,
    filter: { customer: id },
    populate: orderPopulate,
  });

  return successResponse({ res, data: { orders } });
});

export const updateStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // id order

  const order = await dbService.findById({ model: orderModel, id });
  let status = order.status;
  switch (status) {
    case "new":
      order.status = "in_processing";
      break;
    case "in_processing":
      order.status = "ready_to_ship";
      break;
    case "ready_to_ship":
      order.status = "shipped";
      break;
    case "shipped":
      order.status = "delivered";
      break;
    case "delivered":
      order.status = "canceled";
      break;
    case "canceled":
      order.status = "new";
      break;

    default:
      break;
  }

  await order.save();

  return successResponse({ res, message: `Now ${order.status}` });
});

