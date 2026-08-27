import { Router } from "express";
import * as bookServices from "./services/book.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
import upload from "../../utils/uploads/multerUpload.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./book.validation.js";
const router = Router();

router.get("", validation(validators.getAll), bookServices.getAll);
router.post(
  "", 
  // validation(validators.addOne),
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  bookServices.addOne,
);
router.get("/:id", validation(validators.getOne), bookServices.getOne);

router.patch(
  "/:id",
  // validation(validators.updateOne),
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  bookServices.updateOne,
);
router.delete(
  "/:id",
  validation(validators.deleteOne),
  authentication(),
  authorization([roleTypes.admin]),
  bookServices.deleteOne,
);
router.put(
  "/:id/cover",
  validation(validators.cover),
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  upload.singleUpload("cover"),
  bookServices.cover,
);

export default router;
