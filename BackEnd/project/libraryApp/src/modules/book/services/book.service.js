import {
  roleTypes,
  userModel,
  userSelect,
} from "../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import {
  bookModel,
  bookPopulate,
  bookSelect,
} from "../../../DB/models/Book.model.js";
import { authorModel } from "../../../DB/models/Author.model.js";
import { categoryModel } from "../../../DB/models/Category.model.js";
import { filterObject, paginate } from "../../../utils/utils.js";
import uploadBuffer from "../../../utils/uploads/cloudinaryUpload.js";
const publicIdFromUrl = (url = "") => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1].replace(/\.[a-z0-9]+$/i, "") : "";
};

export const addOne = asyncHandler(async (req, res, next) => {
  const {
    title,
    price,
    costPrice,
    subtitle,
    description,
    quantity,
    minQuantity,
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
    description,
    quantity,
    minQuantity,
    pages,
    availableToBorrow,
    author,
    categories,
    createdBy: req.user._id,
  };
  bookData = filterObject(bookData);
  if (
    (await dbService.findOne({
      model: bookModel,
      filter: { title },
    })) != null
  ) {
    return next(new Error("Book already exists", { cause: 400 }));
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
    description,
    quantity,
    minQuantity,
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
    description,
    quantity,
    minQuantity,
    pages,
    availableToBorrow,
    author,
    categories,
    updatedBy: req.user._id,
  };
  data = filterObject(data);

  const book = await dbService.findOneAndUpdate({
    model: bookModel,
    filter: { _id: id },
    data: { ...data },
    options: { new: true },
  });

  if (book == null) {
    return next(new Error("Book not found", { cause: 404 }));
  }

  return successResponse({ res, statusCode: 201, data: { book: book } });
});
export const cover = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!req.file) return next(new Error("No image uploaded", { cause: 404 }));
  const book = await dbService.findById({ model: bookModel, id });
  if (!book) return next(new Error("Book not found", { cause: 404 }));

  if (book.cover) {
    const oldPublicId = publicIdFromUrl(book.cover);
    if (oldPublicId) {
      await deleteUpload(oldPublicId).catch(() => {});
    }
  }
  const uploaded = await uploadBuffer({
    buffer: req.file.buffer,
    folder: `${process.env.APP_NAME}/books/${id}`,
    publicId: "cover",
  });

  book.cover = uploaded.secure_url;
  await book.save();
  return successResponse({
    res,
    data: { book, cover: uploaded.secure_url },
    message: "Cover image updated successfully",
  });
});
export const deleteOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const book = await dbService.findOneAndUpdate({
    model: bookModel,
    filter: { _id: id },
    data: { updatedBy: req.user._id, isDeleted: true },
    options: { new: true },
  });

  if (book == null) {
    return next(new Error("Book not found", { cause: 404 }));
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Book deleted successfully",
  });
});
export const getOne = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const book = await dbService.findById({
    model: bookModel,
    id,
    populate: bookPopulate,
    select: bookSelect,
  });

  if (!book || book.isDeleted) {
    return next(new Error("Book not found", { cause: 404 }));
  }

  return successResponse({ res, data: { book } });
});
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
    const categoryData = await dbService.find({
      model: categoryModel,
      filter: { name: { $regex: category, $options: "i" } },
      select: "_id",
    });

    query.categories = { $in: (categoryData || []).map((c) => c._id) };
  }

  // Publisher filter
  if (publisher) {
    query.publisher = { $regex: publisher, $options: "i" };
  }

  query.isDeleted = false;

  // Sorting
  let sortQuery = { createdAt: -1 };

  if (sort == "price") {
    sortQuery.price = 1;
  }
  if (sort == "-price") {
    sortQuery.price = -1;
  }

  // const books = await dbService.find({
  //   model: bookModel,
  //   filter: query,
  //   sort: sortQuery,
  //   skip,
  //   limit: Number(limit),
  //   populate: bookPopulate,
  //   select: bookSelect,
  // });
  const result = await paginate({
    model: bookModel,
    filter: query,
    sort: sortQuery,
    populate: bookPopulate,
    select: bookSelect,
    limit: Number(limit),
    page: Number(page),
  });

  return successResponse({ res, result });
});
