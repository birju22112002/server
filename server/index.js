/** @format */

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { DATABASE } from "./config.js";
require("dotenv").config();

import authRoutes from "./routes/auth";

// const nodemailer = require("nodemailer");
// const { google } = require("googleapis");

// const CLIENT_ID =
//   "710111662443-pfopir3gvdnqq4ce91h9q5cuk50a6su0.apps.googleusercontent.com";
// const CLIENT_SECRET = "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";
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const REFRESH_TOKEN =
//   "1//04qHrirOjCviNCgYIARAAGAQSNwF-L9Ir-d_hLUPtz0reSsuCPQA95yfWFxvkJEs8YfZzbPbxCX9c1_2f0cMr49gaNAGf4HUczYQ";

// const oAuth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );

// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const morgan = require("morgan");

// async function sendMail() {
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();
//     const transport = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: "Brijeshkachhadiya542@gmail.com",
//         clientId: CLIENT_ID,
//         clientSecret: CLIENT_SECRET,
//         refreshToken: REFRESH_TOKEN,
//         accessToken: accessToken,
//       },
//     });
//     const mailOptions = {
//       from: "Brijesh Kachhadiya <Brijeshkachhadiya542@gmail.com>",
//       to: "brijeshkachhadiya448@gmail.com",
//       subject: "Hello ✔",
//       text: "Hello world?",
//       html: "<b>Hello world?</b>",
//     };
//     const result = await transport.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     return error;
//   }
// }

// sendMail()
//   .then((result) => console.log("Email sent", result))
//   .catch((error) => console.log("Error in sending email ", error));

const app = express();

// db connection
mongoose.set("strictQuery", false);
mongoose
  .connect(DATABASE)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// middlewares
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// route middlewares
app.use("/api", authRoutes);

app.listen(8000, () => console.log("Server running on port 8000"));
