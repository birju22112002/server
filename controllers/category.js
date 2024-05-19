/** @format */

import Category from "../models/category";
import slugify from "slugify";
import Post from "../models/post";

export const create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await new Category({
      name,
      slug: slugify(name),
    }).save();
    res.json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const categories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const removeCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOneAndDelete({ slug });
    res.json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;
    const category = await Category.findOneAndUpdate(
      { slug },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const postsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const posts = await Post.find({ categories: category._id })
      .populate("featuredImage")
      .populate("postedBy", "name") // Ensure to populate the postedBy field if needed
      .limit(20);

    res.json({ posts, category });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
