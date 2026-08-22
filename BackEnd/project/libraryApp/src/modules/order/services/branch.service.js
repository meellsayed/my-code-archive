import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { filterObject } from "../../../utils/utils.js";
import { customerModel } from "../../../DB/models/Customer.model.js";
import { userModel } from "../../../DB/models/User.model.js";
import { stockMovementModel } from "../../../DB/models/StockMovement.model.js";

const orderPopulate = [
  { path: "customer", select: "username phone address type gender" },
  { path: "seller", select: "username phone address type gender" },
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
        path: "items.book",
        select: "price title quantity",
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
    await dbService.create({
      model: stockMovementModel,
      data: {
        book: item.book._id,
        seller: sellerId,
        customerType: "Customer",
        customer: customerData._id,
        quantity: item.quantity,
        price: item.book.price,
      },
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
