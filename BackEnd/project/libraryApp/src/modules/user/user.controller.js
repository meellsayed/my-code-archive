import { Router } from "express";
import * as userServices from "./services/user.service.js";
import { authentication, authorization } from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();



// router.patch(
//   "/:id",
//   authentication(),
//   authorization([roleTypes.admin, roleTypes.staff]),
//   userServices.updateOne,
// );

// router.get("", userServices.getAll);
// router.get("/:id", userServices.getOne); //? done

export default router;
