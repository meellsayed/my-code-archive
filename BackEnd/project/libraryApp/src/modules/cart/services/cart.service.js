import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { bookModel } from "../../../DB/models/Book.model.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { roleTypes } from "../../../DB/models/User.model.js";

// { id } = req.params // book id
// { quantity } = req.body
export const addItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;
  const isStaffCart = req.user.role !== roleTypes.customer;
  const book = await dbService.findById({ model: bookModel, id });
  if (!book) {
    return next(new Error("Book not found", { cause: 404 }));
  }
  if (quantity > book.quantity) {
    return next(new Error(`Quantity in stock: ${book.quantity}`));
  }

  let cart = await dbService.findOne({
    model: cartModel,
    filter: { user: userId, done: false },
    populate: [
      {
        path: "user",
        select: "username",
      },
      {
        path: "order.book",
        select: "title price quantity",
      },
    ],
  });

  if (cart != null) {
    const oldBook = cart.order.find(
      (order) => order.book._id.toString() === id.toString(),
    );

    if (oldBook) {
      if (oldBook.quantity + quantity > book.quantity) {
        return next(new Error(`Quantity in stock: ${book.quantity}`));
      }

      oldBook.quantity += quantity;
      if (oldBook.quantity <= 0) {
        cart.order = cart.order.filter(
          (o) => String(o._id) != String(oldBook._id),
        );
      }
    } else {
      if (quantity > book.quantity) {
        return next(new Error(`Quantity in stock: ${book.quantity}`));
      }

      cart.order.push({
        book: id,
        quantity,
      });
    }

    await cart.save();

    return successResponse({
      res,
      data: { cart },
    });
  }
  // if not old cart create one
  const data = {
    user: userId,
    createdBy: userId,
    order: [{ book: id, quantity }],
    isStaff: isStaffCart,
  };

  cart = await dbService.create({ model: cartModel, data });
  await cart.populate([
    {
      path: "user",
      select: "username",
    },
    {
      path: "order.book",
      select: "title price quantity",
    },
  ]);
  return successResponse({ res, statusCode: 201, data: { cart } });
});

export const removeItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quantity = 1 } = req.body;
  const userId = req.user._id;
  const cart = await dbService.findOne({
    model: cartModel,
    filter: { user: userId, done: false },
    populate: [{ path: "order.book", select: "title price quantity" }],
  });
  if (!cart) {
    return next(new Error("Cart not found", { cause: 404 }));
  }

  const item = cart.order.find((o) => String(o.book._id) === String(id));
  if (!item) {
    return next(new Error("Book not found in cart", { cause: 404 }));
  }

  if (quantity <= 0 || item.quantity - quantity <= 0) {
    cart.order = cart.order.filter((o) => String(o.book._id) !== String(id));
  } else {
    item.quantity -= quantity;
  }

  await cart.save();
  return successResponse({ res, statusCode: 200, data: { cart } });
});

export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const cart = await dbService.findOne({
    model: cartModel,
    filter: { _id: id },
  });
  if (!cart) {
    return next(new Error("Cart not found", { cause: 404 }));
  }
  if (req.user.role === roleTypes.customer) {
    if (String(req.user._id) != String(cart.user)) {
      return next(new Error("That is not your cart", { cause: 403 }));
    }
  }

  return successResponse({ res, data: { cart } });
});
