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
export default router;
