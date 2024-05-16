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

// export const contact = async (name, email, message) => {
//   try {
//     // Prepare email data
//     const mailOptions = {
//       from: EMAIL_FROM,
//       to: process.env.EMAIL_TO,
//       subject: "Email received from contact form",
//       html: `
//       <h3>Contact form message</h3>
//       <p><u>Name</u></p>
//       <p>${name}</p>
//       <p><u>Email</u></p>
//       <p>Email: ${email}</p>
//       <p><u>Message</u></p>
//       <p>${message}</p>
//       `,
//     };

//     // Send email using nodemailer
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent:", info.response);
//     return true;
//   } catch (error) {
//     console.error("Failed to send email:", error);
//     return false;
//   }
// };

export const sendResetCodeEmail = async (email, resetCode) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
      html: `<h3>Your password reset code is: ${resetCode}</h3>`,
    };

    // Send email using nodemailer
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendNewUserEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: "your_email@example.com",
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
