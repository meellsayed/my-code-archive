import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import * as categoryServices from "./services/category.service.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

router.post(
  "/add",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  categoryServices.addOne,
);
router.patch(
  "/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  categoryServices.updateOne,
);
router.delete(
  "/:id",
  authentication(),
  authorization([roleTypes.admin]),
  categoryServices.deleteOne,
);

router.get("", categoryServices.getAll);
router.get("/:id", categoryServices.getOne);
router.get("/books/:id", categoryServices.getCategoryBooks);

export default router;
