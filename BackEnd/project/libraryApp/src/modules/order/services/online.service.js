import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { filterObject } from "../../../utils/utils.js";
import { roleTypes } from "../../../DB/models/User.model.js";
// import { startSession } from "mongoose";

const orderPopulate = [
  { path: "customer", select: "username phone address type gender" },
  { path: "items" },
];

export const buyCart = asyncHandler(async (req, res, next) => {
  const { cartId } = req.params;
  const { note, address } = req.body;
  const userId = req.user._id;
  // ,discount,tax

  let total = 0; // to calc total price and discount and tax

  const cart = await dbService.findById({
    model: cartModel,
    id: cartId,
    populate: [
      {
        path: "order.book",
        select: "price title quantity", // book data not order data
      },
    ],
  });
  if (cart.user != userId) {
    return next(new Error("that is not your cart", { cause: 403 }));
  }

  let ifError = undefined;

  // Check stock
  for (const order of cart.order) {
    if (order.quantity > order.book.quantity || order.book.quantity === 0) {
      ifError = `Quantity (${order.book.title}) in stock: ${order.book.quantity}`;
      break;
    }
  }

  if (ifError) {
    return next(new Error(ifError));
  }

  // Calculate total + update stock
  for (const order of cart.order) {
    total += order.book.price * order.quantity;
    order.book.quantity -= order.quantity;
    await order.book.save();
  }

  const data = filterObject({
    customer: userId,
    items: cartId,
    note,
    address,
    total,
    status: "new",
  });

  const order = await dbService.create({
    model: orderModel,
    data,
    populate: orderPopulate,
  });
  // await session.commitTransaction();

  return successResponse({
    res,
    data: { order, cart },
    statusCode: 200,
  });
});
export const getAll = asyncHandler(async (req, res, next) => {
  const { customer, seller, status } = req.query;

  let query = {};

  if (customer) {
    const customersId = await dbService.find({
      model: customerModel,
      filter: { username: { $regex: customer, $options: "i" } },
      select: "_id",
    });
    query.customer = customersId;
  }
  if (seller) {
    const sellersId = await dbService.find({
      model: sellerModel,
      filter: { username: { $regex: seller, $options: "i" } },
      select: "_id",
    });
    query.seller = sellersId;
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
    filter: { ...query, isDeleted: false },
    populate: orderPopulate,
  });
  return successResponse({ res, data: { orders } });
});
export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await dbService.findOne({
    model: orderModel,
    filter: { _id: id, isDeleted: false, customerType: "User" },
    populate: orderPopulate,
  });
  if (req.user.role != roleTypes.admin || req.user.role != roleTypes.staff) {
    if (req.user._id != order.customer) {
      return next(new Error("that is not your cart", { cause: 403 }));
    }
  }

  return successResponse({ res, data: { order } });
});
