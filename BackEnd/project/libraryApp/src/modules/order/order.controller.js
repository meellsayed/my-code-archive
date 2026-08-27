import { Router } from "express";
import * as onlineServices from "./services/online.service.js";
import * as staffServices from "./services/staff.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

//========================= online ===========================
router.get("/online", authentication(), onlineServices.getOrders);
router.get("/online/:id", authentication(), onlineServices.getOrder);
router.post("/online/cart/:id/buy", authentication(), onlineServices.buyCart);
router.patch(
  "/online/:id/cancel",
  authentication(),
  onlineServices.cancelOrder,
);

//========================= global ===========================
router.get(
  "",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  staffServices.getAll,
);
router.get(
  "/customer/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  staffServices.getCustomerOrders,
);
router.get(
  "/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  staffServices.getOne,
);
router.post(
  "/:id/buy",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  staffServices.buyCart,
);
router.patch(
  "/:id/status",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  staffServices.updateStatus,
);
router.patch("/fast/fast", authentication(), staffServices.fastOrder);
export default router;
