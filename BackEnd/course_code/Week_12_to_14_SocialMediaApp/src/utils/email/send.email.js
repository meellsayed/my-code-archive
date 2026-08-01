import nodemailer from "nodemailer";
import { asyncHandler } from "../response/error.response.js";

/**
 * @param {{ appName?: string, to?: string, cc?: string, bcc?: string, text?: string, attachments?: import('nodemailer').Attachment[], subject?: string, html?: string }} params
 */
export const sendEmail = async ({
  appName = "social Media App",
  to = "",
  cc = "",
  bcc = "",
  text = "",
  attachments = [],
  subject = "",
  html = "",
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `${appName} <${process.env.EMAIL}>`,
    to,
    cc,
    bcc,
    subject,
    html,
    text,
    attachments,
  });
  return info;
};
