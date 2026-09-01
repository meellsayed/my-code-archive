import { Router } from "express";
import * as registrationService from "./services/registration.service.js";
import * as loginService from "./services/login.service.js";
import { validation } from "../../middlewares/validation.middleware.js";
import * as validators from "./auth.validation.js";
import { authentication } from "../../middlewares/auth.middleware.js";
import upload from "../../utils/uploads/multerUpload.js";
const router = Router();

//* Done

// Registration services
router.post(
  "/signup",
  validation(validators.signup),
  registrationService.signup,
);
router.get("/confirm-email/:token", registrationService.confirmEmail);

// Login services
router.post("/login", validation(validators.login), loginService.login);
router.post(
  "/access-token",
  authentication({ tokenType: "refresh" }),
  loginService.accessToken,
);
router.post("/reset-password", authentication(), loginService.resetPassword);
router.post(
  "/forgot-password",
  validation(validators.forgetPasswordSendOtp),
  loginService.forgetPasswordSendOtp,
);
router.get("/forgot-password/:token", loginService.forgetPassword);

export default router;
