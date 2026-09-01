import { Router } from "express";
import * as cartServices from "./services/cart.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./cart.validation.js";
const router = Router();

router.get(
  "",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  cartServices.getAll,
); //* I Will be added search query
router.get("/me", authentication(), cartServices.getAllMe); //* I Will be added search query
router.get("/active", authentication(), cartServices.getActive);
router.get(
  "/:id",
  validation(validators.getOne),
  authentication(),
  cartServices.getOne,
);
router.post(
  "/items/:id",
  validation(validators.addItem),
  authentication(),
  cartServices.addItem,
);
router.patch(
  "/items/:id/decrement",
  validation(validators.decrementItem),
  authentication(),
  cartServices.decrementItem,
);

export default router;
