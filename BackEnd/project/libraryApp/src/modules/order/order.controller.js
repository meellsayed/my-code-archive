import { Router } from "express";
import * as branchServices from "./services/branch.service.js";
import * as onlineServices from "./services/online.service.js";
import * as globalServices from "./services/global.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

//========================= global ===========================
router.get(
  "",
  authorization([roleTypes.admin, roleTypes.staff]),
  authentication(),
  globalServices.getAll,
);

//========================= online ===========================
router.post("/online/buy/:id", authentication(), onlineServices.buyCart); // cart id
router.get("/online", authentication(), onlineServices.getOrders);
router.get("/online/:id", authentication(), onlineServices.getOrder); // order id
//========================= branch ===========================
router.post(
  "/branch/buy/:cartId",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  branchServices.buyCart,
);

export default router;
