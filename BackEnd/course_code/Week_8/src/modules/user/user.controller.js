import { Router } from "express";
import * as userService from "./service/user.service.js";
const router = Router();

router.get("/", userService.userList);
router.get("/profile/:id", userService.userProfile);
router.get("/profile/:id/home", userService.userHome);

router.patch("/profile/:id", userService.updateUserProfile);
router.delete("/profile/:id", userService.deleteUser);
router.post("/profile/:id/restore", userService.restoreUser);
router.delete("/profile/:id/force", userService.forceDeleteUser);

export default router;
