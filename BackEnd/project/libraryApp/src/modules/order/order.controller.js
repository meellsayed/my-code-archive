import { Router } from "express";
import * as cartServices from "./services/cart.service.js";
import * as branchServices from "./services/branch.service.js";
import * as onlineServices from "./services/online.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

//========================= global ============================
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


//========================= online ===========================
router.get("/online/:id", authentication(), onlineServices.getOne);
router.post("/online/buy/:cartId", authentication(), onlineServices.buyCart);
router.get("/online",authentication(),onlineServices.getAll)

//========================= branch ===========================
router.post("/branch/buy/:cartId",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  branchServices.buyCart,
);

export default router;
