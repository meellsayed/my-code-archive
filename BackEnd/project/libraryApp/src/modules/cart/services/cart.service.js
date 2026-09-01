import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { bookModel, bookPopulate } from "../../../DB/models/Book.model.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { roleTypes, userSelect } from "../../../DB/models/User.model.js";
import { paginate } from "../../../utils/utils.js";

const bookSelect =
  "-costPrice -minQuantity -updatedBy -createdBy -updatedAt -createdAt";

export const addItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const userId = req.user._id;
  const book = await dbService.findById({ model: bookModel, id: id });

  if (!book) return next(new Error("Book not found", { cause: 404 }));

  if (quantity > book.quantity)
    return next(new Error(`Quantity in stock: ${book.quantity}`));

  if (book.isDeleted == true)
    return next(new Error("Book is deleted", { cause: 404 }));

  let cart = await dbService.findOne({
    model: cartModel,
    filter: { user: userId, done: false },
    populate: [
      {
        path: "items.book",
        select: bookSelect,
      },
    ],
  });

  if (cart) {
    const oldBook = cart.items.find(
      (items) => items.book._id.toString() === id.toString(),
    );

    if (oldBook) {
      if (oldBook.quantity + quantity > book.quantity) {
        return next(new Error(`Quantity in stock: ${book.quantity}`));
      }

      oldBook.quantity += quantity;
      if (oldBook.quantity <= 0) {
        cart.items = cart.items.filter(
          (o) => String(o._id) != String(oldBook._id),
        );
      }
    } else {
      if (quantity > book.quantity) {
        return next(new Error(`Quantity in stock: ${book.quantity}`));
      }

      cart.items.push({
        book: id,
        quantity,
        price: book.price,
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
    items: [{ book: id, quantity, price: book.price }],
  };

  cart = await dbService.create({ model: cartModel, data });
  await cart.populate([
    {
      path: "items.book",
      select: bookSelect,
    },
  ]);
  return successResponse({ res, statusCode: 201, data: { cart } });
});
export const decrementItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quantity = 1 } = req.body;
  const userId = req.user._id;

  const cart = await dbService.findOne({
    model: cartModel,
    filter: { user: userId, done: false },
    populate: [{ path: "items.book", select: "quantity " + bookSelect }],
  });
  if (cart.user.toString() != userId.toString())
    return next(new Error("This not your Cart", { cause: 403 }));
  if (!cart) return next(new Error("Cart not found", { cause: 404 }));

  const item = cart.items.find((o) => String(o.book._id) === String(id));
  if (!item) return next(new Error("Book not found in cart", { cause: 404 }));

  if (quantity <= 0 || item.quantity - quantity <= 0) {
    cart.items = cart.items.filter((o) => String(o.book._id) !== String(id));
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
  if (!cart) return next(new Error("Cart not found", { cause: 404 }));

  if (req.user.role === roleTypes.customer) {
    if (String(req.user._id) != String(cart.user))
      return next(new Error("That is not your cart", { cause: 403 }));
  }

  return successResponse({ res, data: { cart } });
});
export const getActive = asyncHandler(async (req, res, next) => {
  const cart = await dbService.findOne({
    model: cartModel,
    filter: { user: req.user._id, done: false },
  });
  if (!cart) return successResponse({ res, data: { cart: null } });

  if (req.user.role === roleTypes.customer) {
    if (String(req.user._id) != String(cart.user))
      return next(new Error("That is not your cart", { cause: 403 }));
  }

  return successResponse({ res, data: { cart } });
});
export const getAllMe = asyncHandler(async (req, res, next) => {
  const { sort, page, limit } = req.query;
  const result = await paginate({
    model: cartModel,
    filter: { user: req.user._id },
    populate: [
      {
        path: "items.book",
        select: bookSelect,
      },
    ],
    sort,
    page,
    limit,
  });
  return successResponse({ res, result });
});
export const getAll = asyncHandler(async (req, res, next) => {
  const { done = "", sort = "", page, limit } = req.query;
  let filter = {};
  if (done == "true") filter.done = true;
  else if (done == "false") filter.done = false;
  else filter = {};

  let sortQuery = {};
  switch (sort) {
    case "price":
      sortQuery.items.price = 1;
      break;
    case "-price":
      sortQuery.items.price = -1;
      break;
    case "quantity":
      sortQuery.items.quantity = 1;
      break;
    case "-quantity":
      sortQuery.items.quantity = -1;
      break;
    default:
      break;
  }

  const result = await paginate({
    model: cartModel,
    filter,
    populate: [
      {
        path: "items.book",
        select: bookSelect,
      },
    ],
    sort: sortQuery,
    page,
    limit,
  });
  return successResponse({ res, result });
});
