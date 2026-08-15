import { Router } from "express";
import * as bookServices from "./services/book.service.js";
import { authentication, authorization } from "../../middlewares/auth.middleware.js";
import { runAsyncWorkFinishedHook } from "graphql/execution/hooks.js";
import { roleTypes } from "../../DB/models/User.model.js";
const router = Router();

router.post(
  "/add",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  bookServices.addOne,
);
router.patch(
  "/:id",
  authentication(),
  authorization([roleTypes.admin, roleTypes.staff]),
  bookServices.updateOne,
);
router.delete(
  "/:id",
  authentication(),
  authorization([roleTypes.admin]),
  bookServices.deleteOne,
);

router.get("", bookServices.getAll);
router.get("/:id", bookServices.getOne); //? done

export default router;
