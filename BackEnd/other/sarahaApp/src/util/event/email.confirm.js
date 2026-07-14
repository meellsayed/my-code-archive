import jwt from "jsonwebtoken";
import { EventEmitter } from "node:events";
import { confirmEmailTemplate } from "../email/template/confirm.email.js";
import { sendEmail } from "../email/confirmEmail.js";
import { generateToken } from "../security/token.js";

export const emailEvent = new EventEmitter();

emailEvent.on("sendConfirmEmail", async ({ email }) => {
  const emailToken = generateToken({
    payload: { email },
    options: { expiresIn: "1h" },
  });
  const emailLink = `${process.env.FRONT_END_URL}/confirm-email/${emailToken}`;
  const html = confirmEmailTemplate({ link: emailLink });
  await sendEmail({ to: email, subject: "confirm Email", html });
});
