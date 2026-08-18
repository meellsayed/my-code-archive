import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { bookModel } from "../../../DB/models/Book.model.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { roleTypes } from "../../../DB/models/User.model.js";

//* author order

// { id } = req.params; //? book id
// { quantity } = req.body;
export const addItemAndRemove = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;
  const isStaff = req.user.role == roleTypes.customer ? false : true;
  const book = await dbService.findById({ model: bookModel, id });
  if (quantity > book.quantity) {
    return next(new Error(`Quantity in stock:${book.quantity}`));
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
    } else {
      if (quantity > book.quantity) {
        return next(new Error(`Quantity in stock: ${book.quantity}`));
      }

      cart.order.push({
        book: id,
        quantity,
      });
    }

    cart.updatedBy = userId;

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
    isStaff,
  };

  cart = await dbService.create({ model: cartModel, data });

  return successResponse({ res, statusCode: 201, data: { cart } });
});

// get cart by id
// get order online done