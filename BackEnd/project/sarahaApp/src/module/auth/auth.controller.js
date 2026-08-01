import { Router } from "express";
import { confirmEmail, login, signup } from "./service/registration.service.js";
const router = Router()

router.post('/signup',signup)
router.patch('/confirm-email',confirmEmail)
router.post('/login',login)


export default router