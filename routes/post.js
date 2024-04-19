/** @format */

import express from "express";
const router = express.Router();

// middleware
import { requireSignin, isAdmin } from "../middlewares";
// controllers
import { uploadImage, createPost, posts } from "../controllers/post";

router.post("/upload-image", requireSignin, isAdmin, uploadImage);
router.post("/create-post", requireSignin, isAdmin, createPost);
router.get("/posts", posts);

export default router;
