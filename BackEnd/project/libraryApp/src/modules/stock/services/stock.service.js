import {
  roleTypes,
  userModel,
  userSelect,
} from "../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { filterObject } from "../../../utils/utils.js";
import {
  customerModel,
  customerTypes,
} from "../../../DB/models/Customer.model.js";
import { orderModel } from "../../../DB/models/Order.model.js";
import { bookModel } from "../../../DB/models/Book.model.js";
import { getAll } from "../../book/services/book.service.js";
import { stockMovementModel } from "../../../DB/models/StockMovement.model.js";
const stockMovementPopulate = [
  { path: "book" },
  { path: "seller", select: "-password" },
  { path: "customer", select: "-password" },
];

export const getBooks = getAll; // From book service

export const getBookMovement = asyncHandler(async (req, res, next) => {
  const { author, categories, publisher, sort } = req.query;
  const { id } = req.params;
//حسب الاكثر ربحا
  let query = filterObject({ author, categories, publisher });
  let sortQuery = {}
  switch (sort) {
    case "-price":
      sortQuery.price = 1;
      break;
    case "price":
      sortQuery.price = -1;
      break;

    default:
      break;
  }
  const data = await dbService.find({
    model: stockMovementModel,
    filter: { book: id, ...query },
    populate: stockMovementPopulate,
    sort: sortQuery,
  });

  return successResponse({ res, data });
});

// export const ge
