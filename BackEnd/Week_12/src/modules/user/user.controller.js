import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as profileService from "./services/user.service.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { uploadFile } from "../../utils/file/uploadFile.js";

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

router.get("/find",validation(validators.find),profileService.findUsers)

router.post("/profile/update/basic-info",authentication(),profileService.updateBasicInfo)

router.post(
  "/profile/image",
  authentication(),
  (req, res, next) => {
    req.folderName = "profile-images";
    next();
  },
  uploadFile.single("image"),
  profileService.uploadProfileImage,
);

router.post(
  "/profile/cover-images",
  authentication(),
  (req, res, next) => {
    req.folderName = "cover-images";
    next();
  },
  uploadFile.array("coverImages", 5),
  profileService.uploadCoverImages,
);

export default router;
