import { Router } from "express";
import * as cartServices from "./services/cart.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

// router.get(""); //get all
router.post("/add/:id", authentication(), cartServices.addItem);
router.patch("/remove/:id", authentication(), cartServices.removeItem);
router.get("/:id", authentication(), cartServices.getOne);
export default router;
