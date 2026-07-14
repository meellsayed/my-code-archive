import {Router} from "express";
import { home } from "./services/user.service.js";
const router = Router();


router.get("/", home);





export default router;