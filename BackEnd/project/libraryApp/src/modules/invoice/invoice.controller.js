import { Router } from "express";
import * as cartServices from "./services/cart.service.js";
import * as invoiceServices from "./services/invoice.service.js";
import { authentication } from "../../middlewares/auth.middleware.js";
import { runAsyncWorkFinishedHook } from "graphql/execution/hooks.js";
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

router.post("/buy/cart/:cartId", authentication(), invoiceServices.buyCart);

export default router;
