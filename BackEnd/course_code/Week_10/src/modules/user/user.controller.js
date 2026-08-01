import {Router} from "express";
import { allUsers } from "./services/user.service.js";
const router = Router();


router.get("/list", allUsers);





export default router;