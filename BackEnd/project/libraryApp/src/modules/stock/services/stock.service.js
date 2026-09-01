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
import { authorModel } from "../../../DB/models/Author.model.js";
import { categoryModel } from "../../../DB/models/Category.model.js";
import { stockMovementModel } from "../../../DB/models/StockMovement.model.js";
const stockMovementPopulate = [
  { path: "book" },
  { path: "seller", select: "-password" },
  { path: "customer", select: "-password" },
];
const bookPopulate = [
  { path: "categories" },
  { path: "author" },
  { path: "createdBy", select: "-password" },
  { path: "updatedBy", select: "-password" },
];

export const getBooks = asyncHandler(async (req, res, next) => {
  const { search, category, publisher, sort, page = 1, limit = 10 } = req.query;

  const query = {};

  // Search
  if (search) {
    const authors = await dbService.find({
      model: authorModel,
      filter: {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      select: "_id",
    });
    const authorIds = authors.map((author) => author._id);

    query.$or = [
      { title: { $regex: search, $options: "i" } },
      {
        author: {
          $in: authorIds,
        },
      },
    ];
  }

  // Category filter
  if (category) {
    const categoryData = await dbService.findOne({
      model: categoryModel,
      filter: { name: { $regex: category, $options: "i" } },
      select: "_id",
    });

    if (categoryData) {
      query.categories = categoryData._id;
    } else {
      query.categories = { $in: [] };
    }
  }

  // Publisher filter
  if (publisher) {
    query.publisher = { $regex: publisher, $options: "i" };
  }

  query.isDeleted = false;

  // Sorting
  let sortQuery = {};

  if (sort == "price") {
    sortQuery.price = -1;
  }
  if (sort == "-price") {
    sortQuery.price = 1;
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await bookModel.countDocuments(query);
  let pages = Math.ceil(total / limit);

  const books = await dbService.find({
    model: bookModel,
    filter: query,
    sort: sortQuery,
    skip,
    limit: Number(limit),
    populate: bookPopulate,
  });

  return successResponse({ res, data: { books } });
});
export const getBookMovement = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { sort } = req.query;
  //حسب الاكثر ربحا
  let sortQuery = {};
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
    filter: { book: id },
    // populate: stockMovementPopulate,
    sort: sortQuery,
  });

  return successResponse({ res, data });
});

export const adjustStock = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, type, note } = req.body;

  const book = await dbService.findOne({
    model: bookModel,
    filter: { _id: id, isDeleted: false },
  });
  if (!book) return next(new Error("Book not found", { cause: 404 }));

  const qty = Number(quantity);
  if (!qty || qty <= 0)
    return next(new Error("Quantity must be greater than 0", { cause: 400 }));
  if (!["in", "out"].includes(type))
    return next(new Error("Invalid movement type", { cause: 400 }));

  const delta = type === "in" ? qty : -qty;
  const newQty = Math.max(0, (book.quantity || 0) + delta);

  const movement = await dbService.create({
    model: stockMovementModel,
    data: {
      book: id,
      seller: req.user._id,
      type,
      quantity: qty,
      note: note || "",
      price: book.price || 0,
    },
  });

  await dbService.updateOne({
    model: bookModel,
    filter: { _id: id },
    data: { quantity: newQty },
  });

  return successResponse({
    res,
    statusCode: 201,
    data: { movement, quantity: newQty },
  });
});
