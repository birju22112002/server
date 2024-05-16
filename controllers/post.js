/** @format */

// middleware
import Post from "../models/post";
import Category from "../models/category";
import User from "../models/user";
import Media from "../models/media";
import slugify from "slugify";

import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const uploadImage = async (req, res) => {
  try {
    // console.log(req.body);
    const result = await cloudinary.uploader.upload(req.body.image);

    // console.log(result);
    res.json(result.secure_url);
  } catch (err) {
    console.log(err);
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    // Check if title is taken
    const alreadyExist = await Post.findOne({
      slug: slugify(title.toLowerCase()),
    });
    if (alreadyExist) return res.status(400).json({ error: "Title is taken" });

    // Get category IDs based on category names
    const categoryIds = await Promise.all(
      categories.map(async (categoryName) => {
        try {
          const category = await Category.findOne({ name: categoryName });
          return category ? category._id : null;
        } catch (error) {
          console.log(error);
          return null;
        }
      })
    );

    // Remove null values from categoryIds
    const validCategoryIds = categoryIds.filter((categoryId) => categoryId);

    // Save post
    const post = await new Post({
      ...req.body,
      slug: slugify(title),
      categories: validCategoryIds,
      postedBy: req.user._id,
    }).save();

    // Push the post _id to user's posts []
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { posts: post._id },
    });

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};

export const posts = async (req, res) => {
  try {
    const all = await Post.find()
      .populate({
        path: "featuredImage",
        model: "Media",
      })
      .populate("postedBy", "name")
      .populate("categories", "name slug")
      .sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    console.log(err);
  }
};
export const postsForAdmin = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("postedBy", "_id name")
      .populate("categories", "_id name slug")
      .populate("featuredImage", "url")
      .sort({ createdAt: -1 })
      .exec();
    return res.json(posts);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};

export const uploadImageFile = async (req, res) => {
  try {
    console.log(req.files);
    const result = await cloudinary.uploader.upload(req.files.file.path);
    // save to db
    const media = await new Media({
      url: result.secure_url,
      public_id: result.public_id,
      postedBy: req.user._id,
    }).save();
    res.json(media);
  } catch (err) {
    console.log(err);
  }
};

export const media = async (req, res) => {
  try {
    const media = await Media.find()
      .populate("postedBy", "_id")
      .sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    console.log(err);
  }
};

export const removeMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const singlePost = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug })
      .populate("postedBy", "name")
      .populate("categories", "name slug")
      .populate("featuredImage", "url");
    res.json(post);
  } catch (err) {
    console.log(err);
  }
};

export const removePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, featuredImage, categories } = req.body;

    // Check if the logged-in user is the author of the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this post" });
    }

    // Get category IDs based on category names
    const categoryIds = await Promise.all(
      categories.map(async (categoryName) => {
        try {
          const category = await Category.findOne({ name: categoryName });
          return category ? category._id : null;
        } catch (error) {
          console.log(error);
          return null;
        }
      })
    );

    // Remove null values from categoryIds
    const validCategoryIds = categoryIds.filter((categoryId) => categoryId);

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        slug: slugify(title),
        content,
        categories: validCategoryIds,
        featuredImage,
      },
      { new: true }
    )
      .populate("postedBy", "name")
      .populate("categories", "name slug")
      .populate("featuredImage", "url");

    res.json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};

export const postsByAuthor = async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.user._id })
      .populate("postedBy", "name")
      .populate("categories", "name slug")
      .populate("featuredImage", "url")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};
