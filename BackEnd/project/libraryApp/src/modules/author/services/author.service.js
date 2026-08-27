import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  filterObject,
  paginate,
  paginateAggregation,
} from "../../../utils/utils.js";
import * as dbService from "../../../DB/db.service.js";
import {
  bookModel,
  bookPopulate,
  bookSelect,
} from "../../../DB/models/Book.model.js";
import { authorModel } from "../../../DB/models/Author.model.js";

export const addOne = asyncHandler(async (req, res, next) => {
  const { name, bio, birthDate, deathDate } = req.body;
  let data = {
    name,
    bio,
    birthDate,
    deathDate,
    createdBy: req.user._id,
  };
  data = filterObject(data);

  if (
    (await dbService.findOne({
      model: authorModel,
      filter: { name, isDeleted: false },
    })) != null
  ) {
    return next(new Error("Author already exists", { cause: 400 }));
  }

  const author = await dbService.create({
    model: authorModel,
    data: { ...data },
  });

  return successResponse({ res, statusCode: 201, data: { author } });
});
export const updateOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, bio, birthDate, deathDate } = req.body;
  let data = {
    name,
    bio,
    birthDate,
    deathDate,
    updatedBy: req.user._id,
  };
  data = filterObject(data);

  const author = await dbService.findOneAndUpdate({
    model: authorModel,
    filter: { _id: id },
    data: { ...data },
    options: { new: true },
  });

  if (author == null) {
    return next(new Error("Author not found", { cause: 404 }));
  }

  return successResponse({ res, statusCode: 200, data: { author } });
});
export const deleteOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const author = await dbService.findOneAndUpdate({
    model: authorModel,
    filter: { _id: id },
    data: { updatedBy: req.user._id, isDeleted: true },
    options: { new: true },
  });

  if (author == null) {
    return next(new Error("Author not found", { cause: 404 }));
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Author deleted successfully",
  });
});
export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const author = await dbService.findById({
    model: authorModel,
    id,
  });
  if (!author) {
    return next(new Error("Author not found", { cause: 404 }));
  }

  return successResponse({ res, data: { author } });
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
      let: { authorId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$$authorId", "$author"] },
            isDeleted: false,
          },
        },
      ],
      as: "authorBooks",
    },
  });

  pipeline.push({
    $addFields: {
      booksCount: {
        $size: "$authorBooks",
      },
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

  pipeline.push({ $sort: { createdAt: -1 } }, { $project: { authorBooks: 0 } });

  // const authors = await authorModel.aggregate(pipeline);
  const result = await paginateAggregation({
    model: authorModel,
    pipeline,
    limit: Number(limit),
    page: Number(page),
  });
  return successResponse({ res, result });
});
export const getAuthorBooks = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { search, sort, page = 1, limit = 10 } = req.query;
  const filter = {};

  const author = await dbService.findById({ model: authorModel, id });
  if (!author || author.isDeleted) {
    return next(new Error("Author not found", { cause: 404 }));
  }

  filter.author = id;
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
