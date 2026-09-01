import { Router } from "express";
import * as stockServices from "./services/stock.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

router.get(
  "/books",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  stockServices.getBooks,
);
router.get(
  "/books/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  stockServices.getBookMovement,
);
router.post(
  "/books/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  stockServices.adjustStock,
);

export default router;
