import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as postService from "./services/post.service.js";

const router = Router();

router.post("/create", authentication(), postService.create);
router.get("/:postId", authentication(), postService.sharePost);


export default router;
