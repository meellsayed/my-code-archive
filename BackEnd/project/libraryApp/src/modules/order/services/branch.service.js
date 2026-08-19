import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { filterObject } from "../../../utils/utils.js";
import { customerModel } from "../../../DB/models/Customer.model.js";
import { userModel } from "../../../DB/models/User.model.js";

const orderPopulate = [
  { path: "customer", select: "username phone address type gender" },
  { path: "cart" },
];

export const buyCart = asyncHandler(async (req, res, next) => {
  // customer as object { username, phone, address, gender, type }
  const { id } = req.params; // cart id
  const { note, address, customer } = req.body;
  const sellerId = req.user._id;

  // discount,tax
  if (!customer || !customer.phone) {
    return next(
      new Error("Customer data (name and phone) is required", { cause: 400 }),
    );
  }

  let total = 0;

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

  const cart = await dbService.findOne({
    model: cartModel,
    filter: { _id: id, done: false },
    populate: [
      {
        path: "order.book",
        select: "price title quantity",
      },
    ],
  });
  if (!cart) {
    return next(new Error("Cart not found", { cause: 404 }));
  }
  if (!cart.order?.length) {
    return next(new Error("Cart is empty", { cause: 400 }));
  }

  let ifError = undefined;
  for (const order of cart.order) {
    if (order.quantity > order.book.quantity || order.book.quantity === 0) {
      ifError = `Quantity (${order.book.title}) in stock: ${order.book.quantity}`;
      break;
    }
  }
  if (ifError) {
    return next(new Error(ifError));
  }

  for (const order of cart.order) {
    total += order.book.price * order.quantity;
    order.book.quantity -= order.quantity;
    await order.book.save();
  }

  const data = filterObject({
    customer: customerData._id,
    customerType: "Customer",
    cart: id,
    note,
    address,
    total,
    seller: sellerId,
    createdBy: sellerId,
    status: "delivered",
  });

  const order = await dbService.create({ model: orderModel, data });

  await order.populate(orderPopulate);
  cart.done = true;
  await cart.save();

  return successResponse({
    res,
    data: { order, cart },
    statusCode: 201,
  });
});

export const getCustomerOrders = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const orders = await dbService.find({
    model: orderModel,
    filter: { customer: id, isDeleted: false },
    populate: orderPopulate,
  });

  return successResponse({ res, data: { orders } });
});
// =====================================================================================================
export const getOrders = asyncHandler(async (req, res, next) => {
  const { search, sort, filter } = req.query;
  let query = {};
  let orderFilter = {};
  switch (filter) {
    case "User":
      orderFilter.customerType = "User";
      break;
    case "Customer":
      orderFilter.customerType = "Customer";
      break;

    default:
      break;
  }

  if (search) {
    const [customers, sellers] = await Promise.all([
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
    ]);
    query.$or = [
      {
        customer: { $in: customers },
        seller: { $in: sellers },
      },
      {},
    ];
  }

  query = { ...query, ...orderFilter, isDeleted: false };

  const orders = await dbService.find({
    model: orderModel,
    filter: query,
    populate: orderPopulate,
  });

  return successResponse({ res, data: { orders } });
});
