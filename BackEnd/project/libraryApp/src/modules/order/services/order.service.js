import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { cartModel } from "../../../DB/models/Cart.model.js";
import { invoiceModel } from "../../../DB/models/Invoice.model.js";
import { filterObject } from "../../../utils/utils.js";
// import { startSession } from "mongoose";

export const buyCart = asyncHandler(async (req, res, next) => {
  const { cartId } = req.params;
  const { note, address } = req.body;
  const userId = req.user._id;
  // ,discount,tax
  let total = 0; // to calc total price after discount and tax

  // // const session = await startSession(); //Transactions
  // session.startTransaction();
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
      // session,
    });
    if (cart.user != userId) {
      // await session.abortTransaction();
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
      // await session.abortTransaction();
      return next(new Error(ifError));
    }

    // Calculate total + update stock
    for (const order of cart.order) {
      total += order.book.price * order.quantity;

      order.book.quantity -= order.quantity;

      // await order.book.save({ session });
    }

    const data = filterObject({
      customer: userId,
      items: cartId,
      note,
      address,
      total,
      createdBy: userId,
      status: "new",
    });

    const invoice = await dbService.create({
      model: invoiceModel,
      data,
      // options: { session },
    });
    // await session.commitTransaction();

    return successResponse({
      res,
      data: { invoice, cart },
      statusCode: 200,
    });
  } catch (error) {
    // await session.abortTransaction();
    return next(error);
  } finally {
    // // await session.endSession();
  }
});
