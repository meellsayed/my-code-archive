import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { postModel } from "../../../DB/models/Post.model.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const createPost = asyncHandler(async (req, res, next) => {
  const { title, content, tags } = req.body;

  const post = await dbService.create({
    model: postModel,
    data: {
      title,
      content,
      tags: tags ? tags.split(",") : [],
      createdBy: req.user._id,
    },
  });

  return successResponse({ res, status: 201, data: post });
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const sharePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbService.findOne({
    model: postModel,
    filter: { _id: postId, isDeleted: null },
  });

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  if (!post.viewers.includes(req.user._id)) {
    post.viewers.push(req.user._id);
    post.save();
  }

  return successResponse({
    res,
    data: { post },
  });
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const deletePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.body;
  const post = await dbService.findOneAndUpdate({
    model: postModel,
    filter: { _id: postId, isDeleted: null || undefined },
    data: {
      deletedBy: req.user._id,
      isDeleted: Date.now(),
    },
    options: {},
  });
  if (!post) {
    return next(new Error("not found", { cause: 404 }));
  }
  // post.save()
  return successResponse({ res, data: { post } });
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const updatePost = asyncHandler(async (req, res, next) => {
  const { postId, title, content, tags } = req.body;
  const post = await dbService.findOneAndUpdate({
    model: postModel,
    filter: { _id: postId, isDeleted: null || undefined ,createdBy:req.user._id},
    data: {
      updatedBy:req.user._id,
      content,
      title,
      tags: tags ? tags.split(",") : [],
    },
    options: {},
  });
  if (!post) {
    return next(new Error("Error", { cause: 400 }));
  }
  // post.save()
  return successResponse({ res, data: { post } });
});
