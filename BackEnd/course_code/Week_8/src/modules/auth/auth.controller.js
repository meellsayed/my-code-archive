import { Router } from "express";
const router = Router();
import * as registerService from "./service/registration.service.js";

router.post("/signup", registerService.signup);
router.post("/login", registerService.login);

export default router;
