import nodemailer from "nodemailer";
import { asyncHandler } from "../response/error.response.js";

export const sendEmail = asyncHandler(
  async ({
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
  },
);
