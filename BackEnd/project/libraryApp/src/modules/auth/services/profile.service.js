import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/models/User.model.js";
import { filterObject } from "../../../utils/utils.js";
import {
  uploadBuffer,
  deleteUpload,
} from "../../../utils/uploads/cloudinaryUpload.js";

const publicIdFromUrl = (url = "") => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1].replace(/\.[a-z0-9]+$/i, "") : "";
};

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await dbService.findById({ model: userModel, id: req.user._id });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  return successResponse({ res, data: { user } });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { username, phone, address, gender, image } = req.body;

  const data = filterObject({ username, phone, address, gender, image });

  if (phone) {
    const existing = await dbService.findOne({
      model: userModel,
      filter: { phone, _id: { $ne: req.user._id } },
    });
    if (existing) {
      return next(new Error("Phone already in use", { cause: 400 }));
    }
  }

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data,
    options: { new: true },
  });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  return successResponse({
    res,
    data: { user },
    message: "Profile updated successfully",
  });
});

export const uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No image uploaded", { cause: 400 }));
  }

  const user = await dbService.findById({ model: userModel, id: req.user._id });
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (user.image) {
    const oldPublicId = publicIdFromUrl(user.image);
    if (oldPublicId) {
      await deleteUpload(oldPublicId).catch(() => {});
    }
  }
  const uploaded = await uploadBuffer({
    buffer: req.file.buffer,
    folder: `${process.env.APP_NAME}/users/${req.user._id}`,
    publicId: "profile",
  });

  user.image = uploaded.secure_url;
  await user.save();

  return successResponse({
    res,
    data: { user, image: uploaded.secure_url },
    message: "Profile image updated successfully",
  });
});
