import { Router } from "express";
import * as salesServices from "./services/sales.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

router.get(
  "/sales/total",
  authentication(),
  authorization([roleTypes.admin]),
  salesServices.total,
);
// router.get(
//   "/sales/daily",
//   authentication(),
//   authorization([roleTypes.admin]),
//   salesServices.getBookMovement,
// );
// router.get(
//   "/sales/monthly",
//   authentication(),
//   authorization([roleTypes.admin]),
// );
export default router;
