import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as chatService from "./services/chat.service.js";
const router = Router();

router.get("/:friendId", authentication(), chatService.getChat);

export default router;
