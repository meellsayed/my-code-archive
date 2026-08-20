import { Router } from "express";
import * as bookServices from "./services/book.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
import upload from "../../utils/uploads/multerUpload.js";
const router = Router();

router.post(
  "/add",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  bookServices.addOne,
);
router.post(
  "/cover/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  upload.singleUpload("cover"),
  bookServices.cover,
); // book id

router.patch(
  "/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  bookServices.updateOne,
);
router.delete(
  "/:id",
  authentication(),
  authorization([roleTypes.admin]),
  bookServices.deleteOne,
);

router.get("", bookServices.getAll);
router.get("/:id", bookServices.getOne);

export default router;
