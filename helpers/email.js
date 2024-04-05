/** @format */

import nodemailer from "nodemailer";
import { EMAIL_FROM, EMAIL_PASSWORD } from "../config";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_FROM,
    pass: EMAIL_PASSWORD,
  },
});

export const sendResetCodeEmail = async (email, resetCode) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
      html: `<h3>Your password reset code is: ${resetCode}</h3>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
