import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import {
  filterObject,
  paginate,
  paginateAggregation,
} from "../../../utils/utils.js";
import {
  bookModel,
  bookSelect,
  bookPopulate,
} from "../../../DB/models/Book.model.js";
import { categoryModel } from "../../../DB/models/Category.model.js";

export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await dbService.findById({
    model: categoryModel,
    id,
  });
  if (!category) {
    return next(new Error("Category not found", { cause: 404 }));
  }
  if (category.isDeleted == true) {
    return next(new Error("Category is deleted", { cause: 404 }));
  }

  return successResponse({ res, data: { category } });
});
export const getAll = asyncHandler(async (req, res, next) => {
  const { search, sort, page = 1, limit = 10 } = req.query;
  const pipeline = [];

  if (search) {
    pipeline.push({
      $match: {
        name: { $regex: search, $options: "i" },
      },
    });
  }
  pipeline.push({
    $match: {
      isDeleted: false,
    },
  });
  pipeline.push({
    $lookup: {
      from: "books",
      let: { categoryId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$$categoryId", "$categories"] },
            isDeleted: false,
          },
        },
      ],
      as: "categoryBooks",
    },
  });
  pipeline.push({
    $addFields: {
      booksCount: { $size: "$categoryBooks" },
    },
  });

  if (sort === "booksCount") {
    pipeline.push({
      $sort: {
        booksCount: -1,
      },
    });
  }
  if (sort === "-booksCount") {
    pipeline.push({
      $sort: {
        booksCount: 1,
      },
    });
  }

  pipeline.push({
    $project: {
      categoryBooks: 0,
    },
  });

  const result = await paginateAggregation({
    model: categoryModel,
    pipeline,
    limit: Number(limit),
    page: Number(page),
  });

  return successResponse({ res, result });
});
export const addOne = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  let data = {
    name,
    description,
    createdBy: req.user._id,
  };
  data = filterObject(data);

  if (
    (await dbService.findOne({
      model: categoryModel,
      filter: { name, isDeleted: false },
    })) != null
  ) {
    return next(new Error("Category already exists", { cause: 400 }));
  }

  const category = await dbService.create({
    model: categoryModel,
    data: { ...data },
  });

  return successResponse({ res, statusCode: 201, data: { category } });
});
export const updateOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;
  let data = { name, description };
  data = filterObject(data);

  const category = await dbService.findOneAndUpdate({
    model: categoryModel,
    filter: { _id: id, isDeleted: false },
    data: { ...data },
    options: { new: true },
  });

  if (category == null) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  return successResponse({ res, statusCode: 200, data: { category } });
});
export const deleteOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await dbService.findOneAndUpdate({
    model: categoryModel,
    filter: { _id: id, isDeleted: false },
    data: { isDeleted: true },
    options: { new: true },
  });

  if (category == null) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  return successResponse({
    res,
    statusCode: 200,

    message: "Category deleted successfully",
  });
});
export const getCategoryBooks = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { search, sort, page = 1, limit = 10 } = req.query;
  const filter = {};

  const category = await dbService.findById({ model: categoryModel, id });
  if (!category || category.isDeleted) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  filter.categories = id;
  filter.isDeleted = false;

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }
  const sortQuery = {};
  if (sort === "price") {
    sortQuery.price = -1;
  }
  if (sort === "-price") {
    sortQuery.price = 1;
  }

  // const books = await dbService.find({
  //   model: bookModel,
  //   filter,
  //   populate: bookPopulate,
  //   select: bookSelect,
  //   sort: sortQuery,
  // });

  const result = await paginate({
    model: bookModel,
    filter,
    populate: bookPopulate,
    select: bookSelect,
    sort: sortQuery,
    limit: Number(limit),
    page: Number(page),
  });

  return successResponse({ res, result });
});
