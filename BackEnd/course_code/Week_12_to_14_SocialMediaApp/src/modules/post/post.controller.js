import { Router } from "express";
import { authentication } from "../../middlewares/auth.middleware.js";
import * as postService from "./services/post.service.js";

const router = Router();

router.post("/create", authentication(), postService.createPost);
router.get("/:postId", authentication(), postService.sharePost);
router.delete("/delete", authentication(), postService.deletePost);
router.patch("/update", authentication(), postService.updatePost);

export default router;
