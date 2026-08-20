import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { userModel } from "../../../DB/models/User.model.js";
import { customerModel } from "../../../DB/models/Customer.model.js";

const orderPopulate = [
  { path: "customer", select: "username phone address type gender" },
  { path: "seller", select: "username phone address type gender" },
  { path: "cart" },

  // { path: "book" },
];

export const getAll = asyncHandler(async (req, res, next) => {
  const { search, seller, status, type } = req.query;

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
            { address: { $regex: search, $options: "i" } },
          ],
        },
        select: "_id",
      }),
      dbService.find({
        model: customerModel,
        filter: {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        },
        select: "_id",
      }),
    ]);

    query.customer = { $in: [...usersId, ...customersId] };
  }
  if (seller) {
    const sellersId = await dbService.find({
      model: userModel,
      filter: {
        $or: [
          { username: { $regex: seller, $options: "i" } },
          { email: { $regex: seller, $options: "i" } },
          { phone: { $regex: seller, $options: "i" } },
          { address: { $regex: seller, $options: "i" } },
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

    default:
      break;
  }

  if (type == "online") {
    query.customerType = "User";
  } else if (type == "branch") {
    query.customerType = "Customer";
  }

  const orders = await dbService.find({
    model: orderModel,
    filter: { ...query },
    populate: orderPopulate,
  });
  return successResponse({ res, data: { orders } });
});
export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await dbService.findById({
    model: orderModel,
    id,
    populate: orderPopulate,
  });
  if (!order) {
    return next(new Error("Order not found", { cause: 404 }));
  }

  return successResponse({ res, data: { order } });
});
export const getCustomerOrders = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // customer id

  const orders = await dbService.find({
    model: orderModel,
    filter: { customer: id },
    populate: orderPopulate,
  });

  return successResponse({ res, data: { orders } });
});
export const updateStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await dbService.findById({ model: orderModel, id });
  if (!order) {
    return next(new Error("Order not found", { cause: 404 }));
  }

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
    case "canceled":
      return next(
        new Error("Order is already finished, no further status change", {
          cause: 400,
        }),
      );

    default:
      break;
  }
  await order.save();
  return successResponse({
    res,
    message: `Order status updated to ${order.status}`,
  });
});
