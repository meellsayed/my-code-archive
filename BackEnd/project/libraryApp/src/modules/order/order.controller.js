import { Router } from "express";
import * as cartServices from "./services/cart.service.js";
import * as invoiceServices from "./services/invoice.service.js";
import * as orderServices from "./services/order.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

router.post(
  "/cart/add-item/:id",
  authentication(),
  cartServices.addItemAndRemove,
);
router.post(
  "/cart/remove-item/:id",
  authentication(),
  cartServices.addItemAndRemove,
);

router.post(
  "/staff/buy/cart/:cartId",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  invoiceServices.buyCart,
);

router.post("/buy/cart/:cartId", authentication(), orderServices.buyCart);

export default router;
