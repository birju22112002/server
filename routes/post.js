/** @format */

import express from "express";

import formidable from "express-formidable";

const router = express.Router();

// middleware
import {
  requireSignin,
  isAdmin,
  canCreateRead,
  canUpdateDeletePost,
  canDeleteMedia,
} from "../middlewares";
// controllers
import {
  uploadImage,
  createPost,
  posts,
  uploadImageFile,
  media,
  removeMedia,
  removePost,
  editPost,
  postsByAuthor,
} from "../controllers/post";

router.post("/upload-image", requireSignin, canCreateRead, uploadImage);
router.post(
  "/upload-image-file",
  formidable(),
  requireSignin,
  canCreateRead,
  uploadImageFile
);
router.post("/create-post", requireSignin, canCreateRead, createPost);
router.get("/posts", posts);
// router.get("/post/:slug", singlePost);
router.delete("/post/:postId", requireSignin, canUpdateDeletePost, removePost);
router.put("/edit-post/:postId", requireSignin, canUpdateDeletePost, editPost);

router.get("/posts-by-author", requireSignin, postsByAuthor);

// media
router.get("/media", requireSignin, canCreateRead, media);
router.delete("/media/:id", requireSignin, canDeleteMedia, removeMedia);

export default router;
