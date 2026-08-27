import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import * as categoryServices from "./services/category.service.js";
import { roleTypes } from "../../DB/models/User.model.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./category.validation.js";
const router = Router();

router.get("", validation(validators.getAll), categoryServices.getAll);
router.post(
  "",
  validation(validators.addOne),
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  categoryServices.addOne,
);
router.get("/:id", validation(validators.getOne), categoryServices.getOne);
router.patch(
  "/:id",
  validation(validators.updateOne),
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  categoryServices.updateOne,
);
router.delete(
  "/:id",
  validation(validators.deleteOne),
  authentication(),
  authorization([roleTypes.admin]),
  categoryServices.deleteOne,
);

router.get(
  "/:id/books",
  validation(validators.getCategoryBooks),
  categoryServices.getCategoryBooks,
);

export default router;
