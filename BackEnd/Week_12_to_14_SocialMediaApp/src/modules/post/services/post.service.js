import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { postModel } from "../../../DB/models/Post.model.js";

export const create = asyncHandler(async (req, res, next) => {
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
  }
  post.save();
  return successResponse({
    res,
    data: { post },
  });
});
