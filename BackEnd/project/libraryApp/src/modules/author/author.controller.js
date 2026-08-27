import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import * as authorServices from "./services/author.service.js";
import { roleTypes } from "../../DB/models/User.model.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./author.validation.js";
const router = Router();
//* Done

router.get("", authorServices.getAll);
router.post(
  "",
  validation(validators.addOne),
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  authorServices.addOne,
);
router.get("/:id", authorServices.getOne);
router.patch(
  "/:id",
  validation(validators.updateOne),
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  authorServices.updateOne,
);
router.delete(
  "/:id",
  validation(validators.deleteOne),
  authentication(),
  authorization([roleTypes.admin]),
  authorServices.deleteOne,
);
router.get(
  "/:id/books",
  validation(validators.getAuthorBooks),
  authorServices.getAuthorBooks,
);
export default router;
