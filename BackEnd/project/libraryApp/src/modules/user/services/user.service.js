import { roleTypes, userModel } from "../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { bookModel } from "../../../DB/models/Book.model.js";
import { authorModel } from "../../../DB/models/Author.model.js";
import { categoryModel } from "../../../DB/models/Category.model.js";
import { filterObject } from "../../../utils/utils.js";

export const addUser = asyncHandler(async (req, res, next) => {
  const { username, email, phone, address, image, gender, password, role } =
    req.body;

  const data = filterObject({
    username,
    email,
    phone,
    address,
    image,
    gender,
    password,
    role,
    confirmEmail: true,
  });
  
});

// { id } = req.params;
// { role } = req.body;
export const updateRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    id,
    data: { role },
    options: { new: true },
  });

  if (!user) {
    return next(new Error("User is not exist please add user first"));
  }

  return successResponse({ res, statusCode: 200, data: { user } });
});

// { id } = req.params;
export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await dbService.findById({
    model: userModel,
    id,
  });

  return successResponse({ res, data: { book: user } });
});

// { search, category, publisher, sort, page = 1, limit = 10 } = req.query
export const getAll = asyncHandler(async (req, res, next) => {
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
    query.publisher = publisher;
  }

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
    populate: [
      {
        path: "categories",
        select: "name",
      },
      {
        path: "author",
        select: "name image",
      },
    ],
  });

  return successResponse({ res, data: { books } });
});
