import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { generateToken } from "../security/token.js";
import { verifyEmailTemplate } from "../email/templates/verify.email.template.js";
import { loginDetectedTemplate } from "../email/templates/login.Alert.template.js";
import { emailViewerAttempts } from "../email/templates/viewer.attempts.email.template.js";
import { loginConfirmationOTP } from "../email/templates/login.confirmation.OTP.template.js";
import { generateHash } from "../security/hash.js";
import { sendEmailForgetOtp } from "../email/templates/sendEmailForgetOtp.template.js";

const sendEmailEvent = new EventEmitter();

export const sendEmailEventType = {
  confirmEmail: "Confirm-Email",
  loginAlert: "Login-Alert",
  sendForgetPasswordOTP: "Send-Forget-Password-OTP",
  sendLoginConfirmationOTP: "Login-Confirmation-OTP",
  sendEnable2faOTP: "Enable-2fa-OTP",
};

sendEmailEvent.on(
  sendEmailEventType.confirmEmail,
  async ({ _id, email, otp }) => {
    const confirmEmailToken = generateToken({
      payload: {
        message: sendEmailEventType.confirmEmail,
        confirmEmailOTP: otp,
        email,
        _id,
      },
      signature: process.env.CONFIRM_EMAIL_SIGNATURE,
      options: { expiresIn: 60 * 5 },
    });
    const confirmEmailLink = `${process.env.FRONT_END_URL}/auth/confirm-email/${confirmEmailToken}`;

    const html = verifyEmailTemplate({ confirmEmailLink, otp });
    if (process.env.MOOD === "DEV") {
      console.log(
        `Email confirmation event triggered for: ${email} otp ${otp}`,
      );
      console.log(`confirmEmailLink = http://${confirmEmailLink}`);
    } else {
      await sendEmail({ to: email, subject: "Confirm Email", html });
    }
  },
);

// sendEmailEvent.on("emailLoginAlert", async ({ email }) => {
//   await EmailEvent({
//     to: email,
//     subject: "Email Login Alert",
//     html: loginDetectedTemplate({}),
//   });
//   if (process.env.MOOD === "DEV") {
//     console.log(`Email login Alert event triggered for: ${email}`);
//   }
// });

sendEmailEvent.on(
  sendEmailEventType.sendForgetPasswordOTP,
  async ({ email, otp, newPassword }) => {
    const payload = { email, otp, newPassword };
    const signature = process.env.CONFIRM_FORGET_PASSWORD_SIGNATURE;
    const token = generateToken({ payload, signature, expiresIn: 60 * 10 });
    const forgetPasswordLink = `${process.env.FRONT_END_URL}/auth/forget-password/${token}`;

    const html = sendEmailForgetOtp({ forgetPasswordLink, otp });

    if (process.env.MOOD === "DEV") {
      console.log(
        `Email confirmation event triggered for: ${email} otp ${otp}`,
      );
      console.log(`forgetPasswordLink = http://${forgetPasswordLink}`);
    } else {
      await sendEmail({
        to: email,
        subject: sendEmailEventType.sendForgetPasswordOTP,
        html,
      });
    }
  },
);

sendEmailEvent.on("loginConfirmationOTP", async ({ email, otp, username }) => {
  const html = loginConfirmationOTP({ otp, email, username });
  await sendEmail({ to: email, subject: "Login Confirmation OTP", html });
  if (process.env.MOOD === "DEV") {
    console.log(`Email Login Confirmation OTP event triggered for: ${email}`);
  }
});

sendEmailEvent.on("enable2faSendOTP", async ({ email, otp, username }) => {
  const html = loginConfirmationOTP({ otp, email, username });
  await sendEmail({ to: email, subject: "Enable 2fa Send OTP", html });
  if (process.env.MOOD === "DEV") {
    console.log(`Email Enable 2fa Send OTP event triggered for: ${email}`);
  }
});

export default sendEmailEvent;
