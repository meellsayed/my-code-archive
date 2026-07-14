import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as profileService from "./services/user.service.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";

const router = Router();

router.get("/profile", authentication(), profileService.profile);

router.get(
  "/profile/:profileId",
  validation(validators.shareProfile),
  authentication(),
  profileService.shareProfile,
);

router.post(
  "/block-user",
  validation(validators.blockUser),
  authentication(),
  profileService.blockUser,
);

export default router;
