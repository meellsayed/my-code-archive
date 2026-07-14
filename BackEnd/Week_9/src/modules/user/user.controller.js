import { Router } from "express";
import { allUsers } from "./service/user.service.js";
const router = Router();

router.get("/", allUsers);

export default router;  