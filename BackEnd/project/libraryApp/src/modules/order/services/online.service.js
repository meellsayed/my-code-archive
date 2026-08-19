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

export const buyCart = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { note, address } = filterObject(req.body);

  const userId = req.user._id;
  // ,discount,tax

  let total = 0; // to calc total price and discount and tax

  const cart = await dbService.findOneAndUpdate({
    model: cartModel,
    filter: { _id: id, done: false },
    populate: [
      {
        path: "order.book",
        select: "price title quantity", // book data not order data
      },
    ],
    data: { done: true },
    options: { new: false },
  });
  if (!cart) {
    return next(new Error("Cart not found", { cause: 404 }));
  }

  if (cart.user.toString() != userId.toString()) {
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
  // let items = [];
  // Calculate total + update stock
  for (const order of cart.order) {
    total += order.book.price * order.quantity;
    order.book.quantity -= order.quantity;
    //  await items.push(order.book._id);
    await order.book.save();
  }

  const data = filterObject({
    customer: userId,
    customerType: "User",
    cart: id,
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

  return successResponse({
    res,
    data: { order, cart },
    statusCode: 200,
  });
});
export const getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await dbService.findOne({
    model: orderModel,
    filter: { _id: id, isDeleted: false, customerType: "User" },
    populate: orderPopulate,
  });
  if (!order) {
    return next(new Error("order not found", { cause: 404 }));
  }
  if (req.user.role != roleTypes.admin || req.user.role != roleTypes.staff) {
    if (req.user._id != order.customer) {
      return next(new Error("that is not your order", { cause: 403 }));
    }
  }

  return successResponse({ res, data: { order } });
});
export const getOrders = asyncHandler(async (req, res, next) => {
  const orders = await dbService.find({
    model: orderModel,
    filter: { customer: req.user._id, isDeleted: false },
    populate: orderPopulate,
  });
  return successResponse({ res, data: { orders } });
});

//update and delete
