import { Router } from "express";
const router = Router();
import * as registrationService from "./services/registration.service.js";
import * as loginService from "./services/login.service.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { authentication } from "../../middlewares/auth.middleware.js";

router.post("/signup",
  validation(validators.signup),
  registrationService.signup,
);
router.get("/confirm-email/:token", registrationService.confirmEmail);

router.post("/login", validation(validators.login), loginService.login);
router.get("/refresh-token", authentication("refresh"), loginService.refreshToken);

router.post("/reset-password",
  authentication(),
  validation(validators.resetPassword),
  loginService.resetPassword,
);
router.post("/forget-password",
  validation(validators.sendForgetPasswordOTP),
  loginService.sendForgetPasswordOTP,
);
router.post("/forget-password-otp",
  validation(validators.forgetPasswordOTP),
  loginService.forgetPasswordOTP,
);
router.post("/enable-2fa/send-otp",authentication(),loginService.enable2faSendOTP)
router.post("/enable-2fa/confirm-otp",authentication(),loginService.enable2faConfirmOTP)

router.post("/login/confirmation-otp",validation(validators.confirmLogin),loginService.loginConfirmation)
router.post("/block-user",authentication())
export default router;
