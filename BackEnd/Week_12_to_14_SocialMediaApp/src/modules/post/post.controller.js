import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as postService from "./services/post.service.js";
import * as validators from "./post.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { uploadFile } from "../../utils/upload/uploadFile.js";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/upload/uploadC.js";

const router = Router();

router.post("/create", authentication(), postService.create);

router.get(
  "/profile/:profileId",
  validation(validators.shareProfile),
  authentication(),
  postService.shareProfile,
);

router.post(
  "/block-post",
  validation(validators.blockpost),
  authentication(),
  postService.blockpost,
);

router.get("/find", validation(validators.find), postService.findposts);

router.post(
  "/profile/update/basic-info",
  authentication(),
  postService.updateBasicInfo,
);

router.post(
  "/profile/image",
  authentication(),
  (req, res, next) => {
    req.folderName = "profile-images";
    next();
  },
  uploadCloudFile(fileValidations.image).single("image"),
  postService.ProfileImage,
);

router.post(
  "/profile/cover-images",
  authentication(),
  (req, res, next) => {
    req.folderName = "cover-images";
    next();
  },
  uploadFile.array("coverImages", 5),
  postService.uploadCoverImages,
);

export default router;
