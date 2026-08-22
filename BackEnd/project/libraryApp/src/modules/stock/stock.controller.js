import { Router } from "express";
import * as stockServices from "./services/stock.service.js";
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
  stockServices.getBooks,
);
router.get (
   "/book/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  stockServices.getBookMovement,

)
export default router;
