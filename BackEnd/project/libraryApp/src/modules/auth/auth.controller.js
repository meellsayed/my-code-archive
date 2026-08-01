import {Router} from "express";
const router = Router();
import { login } from "./services/registration.service.js";


router.get("/login", login);

export default router;