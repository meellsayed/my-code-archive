import { Router } from "express";
const router = Router();
import { confirmEmail, login, signup } from "./services/registration.service.js";

router.post("/signup", signup);
router.patch("/confirm-email", confirmEmail);
router.post("/login", login);

export default router;
