import { Router } from "express";
const router = Router();
import { signup } from "./services/registration.service.js";

router.post("/signup", signup);

export default router;
