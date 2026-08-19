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
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  globalServices.getAll,
);
router.get(
  "/customer/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  globalServices.getCustomerOrders,
);
//========================= online ===========================
router.post("/online/buy/:id", authentication(), onlineServices.buyCart); // cart id
router.get("/online", authentication(), onlineServices.getOrders);
router.get("/online/:id", authentication(), onlineServices.getOrder); // order id
//========================= branch ===========================
router.post(
  "/branch/buy/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  branchServices.buyCart,
);
//================================================================================
router.get(
  "/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  globalServices.getOne,
);

export default router;
