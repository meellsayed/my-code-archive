import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { invoiceModel } from "../../../DB/models/Invoice.model.js";
import { filterObject } from "../../../utils/utils.js";
import { startSession } from "mongoose";

export const buyCart = asyncHandler(async (req, res, next) => {
  const { cartId } = req.params;
  const { note, address } = req.body;
  const userId = req.user._id;
  // ,discount,tax
  let total = 0; // to calc total price after discount and tax
  const session = await startSession(); //Transactions

  try {
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
    // order have bookId and quantity
    cart.order.forEach((order) => {
      if (order.quantity > order.book.quantity || order.book.quantity == 0) {
        ifError = `Quantity (${order.book.title}) in stock: ${order.book.quantity}`;
      }
    });
    if (ifError) return next(new Error(ifError));

    cart.order.forEach(async (order) => {
      total += order.book.price * order.quantity; // calc Total price
      order.book.quantity -= order.quantity;
      await order.book.save();
    });

    let data = {
      customer: userId,

      items: cartId,
      note,
      address,
      total,
      createdBy: userId,
    };
    data = filterObject(data);

    const invoice = await dbService.create({ model: invoiceModel, data });
    await session.commitTransaction();

    return successResponse({
      res,
      data: { invoice, cart },
      statusCode: 200,
    });

    
  } catch (error) {
    await session.abortTransaction();
    return next(new Error("Session Transactions Error"));
  } finally {
    session.endSession();
  }
});
