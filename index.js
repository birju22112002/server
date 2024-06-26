/** @format */

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { DATABASE } from "./config.js";

import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/category";
import postRoutes from "./routes/post";
import websiteRoutes from "./routes/website";

const morgan = require("morgan");

const app = express();
const http = require("http").createServer(app);
// db connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR: ", err));

// middlewares
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// route middlewares
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", postRoutes);
app.use("/api", websiteRoutes);

const port = process.env.PORT || 8000;

http.listen(port, () => console.log(`Server running on port ${port}`));
