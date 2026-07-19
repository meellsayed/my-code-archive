import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/models/User.model.js";
import sendEmailEvent from "../../../utils/event/send.email.event.js";

export const profile = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: req.user._id, isDeleted: false },
    populate: [
      {
        path: "viewers.viewerId",
      },
    ],
  });
  return successResponse({ res, status: 200, data: { user } });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;

  const userProfile = await userModel.findOne({
    _id: profileId,
    isDeleted: false,
  });

  if (!userProfile) {
    return next(new Error("User profile not found", { cause: 404 }));
  }
  if (userProfile.blockedUsers.includes(req.user._id.toString())) {
    return next(new Error("User blocked you", { cause: 403 }));
  }

  if (profileId.toString() !== req.user._id.toString()) {
    let viewer = userProfile.profileViewHistory.find(
      (element) => element.viewerId.toString() === req.user._id.toString(),
    );

    if (!viewer) {
      userProfile.profileViewHistory.push({
        viewerId: req.user._id,
        attempts: [new Date()],
      });
    } else {
      viewer.attempts.push(new Date());

      if (viewer.attempts.length === 6) {
        // send email
        sendEmailEvent.emit("emailViewerAttempts", {
          username: userProfile.username,
          email: userProfile.email,
        });
        viewer.attempts.shift();
      }
    }

    await userProfile.save();
  }

  return successResponse({
    res,
    data: {
      user: {
        username: userProfile.username,
        image: userProfile.image,
        email: userProfile.email,
      },
    },
  });
});

export const blockUser = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = req.user;
  const blockedUser = await userModel.findOne({
    email,
    isDeleted: false,
  });

  if (!blockedUser) {
    return next(new Error("User profile not found", { cause: 404 }));
  }

  if (user.blockedUsers.includes(blockedUser._id.toString())) {
    return next(new Error("User profile blocked before", { cause: 400 }));
  }

  user.blockedUsers.push({ _id: blockedUser._id });
  await user.save();
  return successResponse({
    res,
    message: "user blocked",
    data: { blockedUsers: user.blockedUsers },
  });
});

export const findUsers = asyncHandler(async (req, res, next) => {
  const { email, username, address } = req.body;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const users = await dbService.find({
    model: userModel,
    filter: { $or: [{ address }, { username }, { email }] },
    limit: limit,
    select: "username _id image confirmEmail phone gender",
    skip: (page - 1) * limit,
  });

  if (!users) {
    return next(new Error("user not found!!", { cause: 404 }));
  }
  return successResponse({
    res,
    data: { users: users },
    message: `user find page: ${page}`,
  });
});

export const updateBasicInfo = asyncHandler(async (req, res, next) => {
  const { username, phone, DOB, address, image, coverImages, gender } =
    req.body;

  let user = req.user;
  if (!user) {
    return next(new Error("user not fond", { cause: 404 }));
  }

  const updates = Object.fromEntries(
    Object.entries({
      username,
      phone,
      DOB,
      address,
      image,
      coverImages,
      gender,
    }).filter(([, value]) => value !== undefined),
  );
  Object.assign(user, updates);

  await user.save();
  return successResponse({
    res,
    message: "profile updated",
    data: { user },
  });
});

export const uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("Please upload a file", { cause: 400 }));
  }

  const user = req.user;
  user.image = req.file.path;
  await user.save();

  return successResponse({
    res,
    message: "Profile image uploaded",
    data: { image: user.image },
  });
});

export const uploadCoverImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new Error("Please upload files", { cause: 400 }));
  }

  const user = req.user;
  const coverImages = req.files.map((file) => file.path);
  user.coverImages = [...(user.coverImages || []), ...coverImages];
  await user.save();

  return successResponse({
    res,
    message: "Cover images uploaded",
    data: { coverImages: user.coverImages },
  });
});
