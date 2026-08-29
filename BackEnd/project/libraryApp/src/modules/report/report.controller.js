import { Router } from "express";
import * as salesServices from "./services/sales.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

router.get(
  "/sales",
  authentication(),
  authorization([roleTypes.admin]),
  salesServices.sales,
);
router.get("/sales/top",salesServices.topSales)

export default router;
