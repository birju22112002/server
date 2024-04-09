/** @format */

import Category from "../models/category";
import slugify from "slugify";

export const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ error: "Name is required and should be a string" });
    }
    const category = await new Category({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).json(category);
    // console.log("saved category", category);
    // res.json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const categories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    console.log(err);
  }
};

export const removeCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOneAndDelete({ slug });
    res.json(category);
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
  }
};
