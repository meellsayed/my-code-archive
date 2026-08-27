import { Router } from "express";
import * as userService from "./services/user.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./user.validation.js";
import upload from "../../utils/uploads/multerUpload.js";

const router = Router();

// Profile Services
router.get("/me", authentication(), userService.getProfile);
router.patch(
  "/me",
  validation(validators.updateProfile),
  authentication(),
  userService.updateProfile,
);
router.put(
  "/me/avatar",
  authentication(),
  upload.singleUpload("image"),
  userService.uploadProfileImage,
);

export default router;
