/** @format */
import User from "../models/user";
import Post from "../models/post";
import Media from "../models/media";
import Comment from "../models/comment";

// import jwt from "jsonwebtoken";

import expressJwt from "express-jwt";
require("dotenv").config();
// req.user = _id
export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  // userProperty: "auth",
});

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== "Admin") {
      return res.status(403).send("Unauhorized");
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

export const isAuthor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== "Author") {
      return res.status(403).send("Unauhorized");
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

export const canCreateRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    console.log("user", user);
    switch (user.role) {
      case "Admin":
        next();
        break;
      case "Author":
        next();
        break;
      default:
        return res.status(403).send("Unauhorized");
    }
  } catch (err) {
    console.log(err);
  }
};

export const canUpdateDeletePost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.params.postId);
    switch (user.role) {
      case "Admin":
        next();
        break;
      case "Author":
        if (post.postedBy.toString() !== user._id.toString()) {
          return res.status(403).send("Unauhorized");
        } else {
          next();
        }
        break;
      default:
        return res.status(403).send("Unauhorized");
    }
  } catch (err) {
    console.log(err);
  }
};

export const canDeleteMedia = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const media = await Media.findById(req.params.id);
    switch (user.role) {
      case "Admin":
        next();
        break;
      case "Author":
        if (media.postedBy.toString() !== req.user._id.toString()) {
          return res.status(403).send("Unauhorized");
        } else {
          next();
        }
        break;
    }
  } catch (err) {
    console.log(err);
  }
};
export const canUpdateDeleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      console.log("Comment not found");
      return res.status(404).json({ error: "Comment not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      console.log("User not found");
      return res.status(403).json({ error: "Unauthorized" });
    }

    // console.log(
    //   `User role: ${user.role}, User ID: ${user._id}, Comment posted by: ${comment.postedBy}`
    // );

    switch (user.role) {
      case "Admin":
        next();
        break;
      case "Author":
      case "Subscriber":
        if (comment.postedBy.toString() === req.user._id.toString()) {
          next();
        } else {
          return res.status(403).json({ error: "Unauthorized" });
        }
        break;
      default:
        return res.status(403).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};
