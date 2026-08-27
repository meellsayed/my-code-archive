import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { userModel, userSelect } from "../../../DB/models/User.model.js";
import { customerModel } from "../../../DB/models/Customer.model.js";
import { filterObject, paginate } from "../../../utils/utils.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { stockEvent } from "../../../utils/events/stock.event.js";

const orderPopulate = [
  { path: "customer", select: userSelect },
  { path: "seller", select: userSelect },
  { path: "cart", populate: { path: "items.book", select: "title price cover author" } },
];
const bookSelect = "-costPrice -minQuantity -updatedBy -createdBy";

export const getAll = asyncHandler(async (req, res, next) => {
  const { search, seller, status, type, sort, page, limit } = req.query;

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

  const result = await paginate({
    model: orderModel,
    filter: { ...query },
    populate: orderPopulate,
    sort,
    page,
    limit,
  });
  return successResponse({ res, result });
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
  const { id } = req.params;
  const { sort, page, limit } = req.query;

  const result = await paginate({
    model: orderModel,
    filter: { customer: id },
    populate: orderPopulate,
    sort,
    page,
    limit,
  });

  return successResponse({ res, result });
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
        path: "items.book",
        select: bookSelect,
      },
    ],
  });
  if (!cart) {
    return next(new Error("Cart not found", { cause: 404 }));
  }
  if (!cart.items?.length) {
    return next(new Error("Cart is empty", { cause: 400 }));
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
    stockEvent.emit("create", {
      book: item.book,
      seller: sellerId,
      customerType: "Customer",
      customer: customerData._id,
      type: "out",
      quantity: item.quantity,
    });
    await item.save();
    await item.book.save();
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
export const posOrder = asyncHandler(async (req, res, next) => {
  const { items } = req.body; // [ { book, quantity } ]
  const cart = await dbService.create({
    model: cartModel,
    data: { user: req.user._id, items, done: true },
  });
  await cart.populate([
    {
      path: "items.book",
      select: bookSelect,
    },
  ]);
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

  let total = 0;
  for (const item of cart.items) {
    total += item.book.price * item.quantity;
    item.book.quantity -= item.quantity;
    item.price = item.book.price;

    stockEvent.emit("create", {
      book: item.book,
      seller: req.user._id,
      customerType: "Fast",
      type: "out",
      quantity: item.quantity,
    });

    await item.save();
    await item.book.save();
  }
  return successResponse({ res, data: { cart } });
});
