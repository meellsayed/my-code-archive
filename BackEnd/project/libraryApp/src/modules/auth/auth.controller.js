import { Router } from "express";
import * as registrationService from "./services/registration.service.js";
import * as loginService from "./services/login.service.js";

import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./auth.validation.js";
import { authentication } from "../../middlewares/auth.middleware.js";
const router = Router();

router.post(
  "/signup",
  validation(validators.signup),
  registrationService.signup,
);
router.get(
  "/confirm-email/:confirmEmailToken",
  registrationService.confirmEmail,
); // post

router.post("/login", validation(validators.login), loginService.login);
router.post(
  "/refresh-token",
  authentication("refresh"),
  loginService.refreshToken,
);
router.post(
  "/forget-password-send",
  validation(validators.forgetPasswordSendOtp),
  loginService.forgetPasswordSendOtp,
);
router.get(
  "/forget-password/:forgetPasswordToken",
  loginService.forgetPassword,
); // post

export default router;
