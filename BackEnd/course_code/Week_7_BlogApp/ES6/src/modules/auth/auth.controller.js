import { Router } from "express";
export const router = Router();
import * as registrServices from "./services/registration.service.js";

router.get("/signup", registrServices.signup);
router.get("/login", registrServices.login);
