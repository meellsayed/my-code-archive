import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { generateToken } from "../security/token.js";
import { verifyEmailTemplate } from "../email/templates/verify.email.template.js";
import { loginDetectedTemplate } from "../email/templates/login.Alert.template.js";
import { emailViewerAttempts } from "../email/templates/viewer.attempts.email.template.js";
import { otpForgetPasswordTemplate } from "../email/templates/otpForgetPassword.email.template.js";
import { loginConfirmationOTP } from "../email/templates/login.confirmation.OTP.template.js";
import { generateHash } from "../security/hash.js";

const sendEmailEvent = new EventEmitter();

export const emailSubject = {
  confirmEmail: "Confirm-Email",
  loginAlert: "Login-Alert",
  viewerAttempts: "Viewer-Attempts",
  sendForgetPasswordOTP: "Forget-Password-OTP",
  sendLoginConfirmationOTP: "Login-Confirmation-OTP",
  sendEnable2faOTP: "Enable-2fa-OTP",
};

// export const sendOTP = async ({
//   data: { _id, email ,confirmEmailLink} = {},
//   subject = emailSubject.confirmEmail,
// }) => {
//   const { _id, email } = data;
//   const otp = Math.floor(10000 + Math.random() * 90000).toString();
//   const hashOTP = generateHash({ plainText: otp });

//   switch (subject) {
//     case emailSubject.confirmEmail:
//       updateDate = { confirmEmailOTP: hashOTP };
//       html = verifyEmailTemplate({ confirmEmailLink:data.confirmEmailLink });
//       break;
//       case emailSubject.:
//       updateDate = { confirmEmailOTP: hashOTP };
//       html = verifyEmailTemplate({ confirmEmailLink:data.confirmEmailLink });
//       break;

//     default:
//       break;
//   }
// };

sendEmailEvent.on("confirmEmail", async ({ email, code }) => {
  const emailToken = generateToken({
    payload: { message: "Confirm Email", confirmEmailOTP: code, email },
    signature: process.env.CONFIRM_EMAIL_TOKEN,
    options: { expiresIn: 60 * 5 },
  });
  const confirmEmailLink = `${process.env.FRONT_END_URL}/auth/confirm-email/${emailToken}`;
  const html = verifyEmailTemplate({ confirmEmailLink ,code });
  await sendEmail({ to: email, subject: "Confirm Email", html });
  if (process.env.MOOD === "DEV") {
    console.log(`Email confirmation event triggered for: ${email}`);
  }
});

sendEmailEvent.on("emailLoginAlert", async ({ email }) => {
  await EmailEvent({
    to: email,
    subject: "Email Login Alert",
    html: loginDetectedTemplate({}),
  });
  if (process.env.MOOD === "DEV") {
    console.log(`Email login Alert event triggered for: ${email}`);
  }
});

sendEmailEvent.on("emailViewerAttempts", async ({ username, email }) => {
  await sendEmail({
    to: email,
    subject: "Email viewer attempts",
    html: emailViewerAttempts({ username, viewsCount: 6, profileUrl: email }),
  });
  if (process.env.MOOD === "DEV") {
    console.log(`Email viewer attempts event triggered for: ${email}`);
  }
});

sendEmailEvent.on("otpForgetPassword", async ({ email, otp }) => {
  const html = otpVerificationTemplate({ code: otp });
  await sendEmail({ to: email, subject: "OTP Forget Password", html });
  if (process.env.MOOD === "DEV") {
    console.log(`Email OTP Forget Password event triggered for: ${email}`);
  }
});

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
