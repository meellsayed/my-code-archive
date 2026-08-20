import { Router } from "express";
import * as customerServices from "./services/customer.service.js";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

router.post(
  "/add",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  customerServices.addOne,
);
router.delete(
  "/:id",
  authentication(),
  authorization([roleTypes.admin]),
  customerServices.deleteOne,
);
// router.patch(
//   "/:id",
//    authentication(),
//   authorization([roleTypes.admin, roleTypes.staff]),
//   customerServices.updateOne,
// );

router.get(
  "",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  customerServices.getAll,
);
router.get(
  "/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  customerServices.getOne,
);

export default router;
