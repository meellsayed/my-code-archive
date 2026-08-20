import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/models/User.model.js";
import { filterObject } from "../../../utils/utils.js";

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