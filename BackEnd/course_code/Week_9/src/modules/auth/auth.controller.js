import { Router } from "express";
import { login, signup } from "./service/registration.service.js";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
export default router;
