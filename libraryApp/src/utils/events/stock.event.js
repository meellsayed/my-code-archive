import { EventEmitter } from "node:events";
import * as dbService from "../../DB/db.service.js";
import { stockMovementModel } from "../../DB/models/StockMovement.model.js";
import { filterObject } from "../utils.js";

export const stockEvent = new EventEmitter();

stockEvent.on(
  "create",
  async ({
    book,
    seller,
    type = "out",
    customerType = "Customer",
    customer,
    quantity,
    price,
  } = {}) => {
    if (!price) price: book.price;
    if (book._id) book = book._id;

    const data = filterObject({
      book,
      seller,
      type,
      customerType,
      customer,
      quantity,
      price,
    });

    await dbService.create({ model: stockMovementModel, data });
  },
);
