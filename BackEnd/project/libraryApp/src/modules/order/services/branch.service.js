import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { filterObject } from "../../../utils/utils.js";
import { customerModel } from "../../../DB/models/Customer.model.js";

const orderPopulate = [
  { path: "customer", select: "username phone address type gender" },
  { path: "items" },
];

export const buyCart = asyncHandler(async (req, res, next) => {
  // customer as object { username, phone, address, gender, type }
  const { cartId } = req.params;
  let { note, address, customer } = req.body;
  const sellerId = req.user._id;

  // discount,tax
  let total = 0; // to calc total price

  let customerData = null;

  customerData = await dbService.findOne({
    model: customerModel,
    filter: { phone: customer.phone },
  });

  if (!customerData) {
    customerData = await dbService.create({
      model: customerModel,
      data: { ...customer, createdBy: sellerId },
    });
  }
  customer = customerData;

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
  if (!cart) {
    return next(new Error("cart not found", { cause: 404 }));
  }
  if (!cart.order?.length) {
    return next(new Error("no order"));
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
    customer: customer._id,
    customerType: "Customer",
    items: cartId,
    note,
    address,
    total,
    seller: sellerId,
    createdBy: sellerId,
    status: "done",
  });

  const order = await dbService.create({ model: orderModel, data });

  await order.populate([
    { path: "customer" },
    { path: "seller" },
    // { path: "items" },
    { path: "items.order.book" },
  ]);
  cart.order = [];
  await cart.save();

  return successResponse({
    res,
    data: { order, cart },
    statusCode: 200,
  });
});
export const getCustomerOrder = asyncHandler(async (req, res, next) => {
  const { customerId } = req.params;
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
