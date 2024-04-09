/** @format */

import express from "express";
const router = express.Router();

// middleware
import { requireSignin, isAdmin } from "../middlewares";

// controllers
import {
  create,
  categories,
  removeCategory,
  updateCategory,
} from "../controllers/category";

router.post("/category", requireSignin, create);
router.get("/api/categories", requireSignin, categories);
router.delete("/api/category/:slug", requireSignin, removeCategory);
router.put("/api/category/:slug", requireSignin, updateCategory);
router.post("/category", requireSignin, isAdmin, create);

export default router;
