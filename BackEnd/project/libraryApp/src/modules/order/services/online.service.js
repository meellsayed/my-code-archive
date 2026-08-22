import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { filterObject } from "../../../utils/utils.js";
import { stockMovementModel } from "../../../DB/models/StockMovement.model.js";

const orderPopulate = [
  { path: "customer", select: "username phone address type gender" },
  { path: "seller", select: "username phone address type gender" },
  { path: "cart" },
];

export const buyCart = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { note, address } = filterObject(req.body);

  const userId = req.user._id;
  // ,discount,tax

  let total = 0;

  const cart = await dbService.findOne({
    model: cartModel,
    filter: { _id: id, done: false },
    populate: [{ path: "items.book", select: "price title quantity" }],
  });
  if (!cart) {
    return next(new Error("Cart not found", { cause: 404 }));
  }

  if (String(cart.user) != String(userId)) {
    return next(new Error("That is not your cart", { cause: 403 }));
  }

  let ifError = undefined;

  for (const items of cart.items) {
    if (items.quantity > items.book.quantity || items.book.quantity === 0) {
      ifError = `Quantity (${items.book.title}) in stock: ${items.book.quantity}`;
      break;
    }
  }

  if (ifError) {
    return next(new Error(ifError));
  }

  for (const item of cart.items) {
    total += item.book.price * item.quantity;
    item.book.quantity -= item.quantity;
    item.price = item.book.price;
    await dbService.create({
      model: stockMovementModel,
      data: {
        book: item.book._id,
        customerType: "User",
        customer: userId,
        quantity: item.quantity,
        price: item.book.price,
      },
    });
    await item.save();
    await item.book.save();
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

  cart.done = true;
  await cart.save();

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
    return next(new Error("Order not found", { cause: 404 }));
  }

  if (String(req.user._id) != String(order.customer._id)) {
    return next(new Error("That is not your order", { cause: 403 }));
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
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await dbService.findOne({
    model: orderModel,
    filter: { _id: id, customerType: "User" },
    populate: orderPopulate,
  });
  if (!order) {
    return next(new Error("Order not found", { cause: 404 }));
  }

  if (String(order.customer._id) != String(req.user._id))
    return next(new Error("That is not your order", { cause: 403 }));

  if (
    order.status === "delivered" ||
    order.status === "canceled" ||
    order.status === "shipped"
  )
    return next(new Error("Order cannot be canceled", { cause: 400 }));

  order.status = "canceled";
  await order.save();

  return successResponse({ res, message: "Order canceled successfully" });
});
