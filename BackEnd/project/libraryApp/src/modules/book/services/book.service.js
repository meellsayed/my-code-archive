import { userModel } from "../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { bookModel } from "../../../DB/models/Book.model.js";
import { authorModel } from "../../../DB/models/Author.model.js";
import { categoryModel } from "../../../DB/models/Category.model.js";
import { filterObject } from "../../../utils/utils.js";

export const addOne = asyncHandler(async (req, res, next) => {
  const {
    title,
    price,
    costPrice,
    subtitle,
    cover,
    description,
    quantity,
    minQuantity,
    status,
    pages,
    availableToBorrow,
    author,
    categories, //["_id"]
  } = req.body;
  let bookData = {
    title,
    price,
    costPrice,
    subtitle,
    cover,
    description,
    quantity,
    minQuantity,
    status,
    pages,
    availableToBorrow,
    author,
    categories,
    createdBy: req.user._id,
  };
  bookData = filterObject(bookData);
  const populate = [
    {
      path: "categories",
      select: "name",
    },
    {
      path: "author",
      select: "name",
    },
  ];

  if (
    (await dbService.findOne({
      model: bookModel,
      filter: { title },
    })) != null
  ) {
    return next(new Error("Book is exist"));
  }
  
  const book = await dbService.create({
    model: bookModel,
    data: { ...bookData },
    populate,
  });

  return successResponse({ res, statusCode: 201, data: { book: book } });
});

export const updateOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    price,
    costPrice,
    subtitle,
    cover,
    description,
    quantity,
    minQuantity,
    status,
    pages,
    availableToBorrow,
    author,
    categories,
  } = req.body;
  let data = {
    title,
    price,
    costPrice,
    subtitle,
    cover,
    description,
    quantity,
    minQuantity,
    status,
    pages,
    availableToBorrow,
    author,
    categories,
    updatedBy: req.user._id,
  };
  data = filterObject(data);
  const populate = [
    {
      path: "categories",
      select: "name",
    },
    {
      path: "author",
      select: "name",
    },
  ];

  const book = await dbService.findOneAndUpdate({
    model: bookModel,
    filter: { _id: id },
    data: { ...data },
    options: { new: true },
  });

  if (book == null) {
    return next(new Error("Book is not exist please add your book"));
  }

  return successResponse({ res, statusCode: 201, data: { book: book } });
});

// { id } = req.params;
export const deleteOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const book = await dbService.findOneAndUpdate({
    model: bookModel,
    filter: { _id: id },
    data: { updatedBy: req.user._id, isDeleted: true },
    options: { new: true },
  });

  if (book == null) {
    return next(new Error("Book is not exist"));
  }

  return successResponse({ res, statusCode: 200, message: "Delete Done" });
});

// { id } = req.params;
export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const book = await dbService.findById({
    model: bookModel,
    id,
    populate: [
      {
        path: "author",
        select: "name image",
      },
      {
        path: "categories",
        select: "name",
      },
      {
        path: "createdBy",
        select: "username image email",
      },
    ],
  });

  return successResponse({ res, data: { book } });
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
