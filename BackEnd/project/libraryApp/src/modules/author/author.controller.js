import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import * as authorServices from "./services/author.service.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

router.post(
  "/add",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  authorServices.addOne,
);
router.patch(
  "/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  authorServices.updateOne,
);
router.delete(
  "/:id",
  authentication(),
  authorization([roleTypes.admin]),
  authorServices.deleteOne,
);

router.get("", authorServices.getAll);
router.get("/:id", authorServices.getOne);
router.get("/books/:id", authorServices.getAuthorBooks);

export default router;
 