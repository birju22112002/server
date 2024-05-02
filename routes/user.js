/** @format */

// In server/routes/user.js

import express from "express";
import User from "../models/user";

const router = express.Router();

// Route to fetch a specific user by ID
// router.get("/admin/users/:userId", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     // Exclude sensitive information like password before sending response
//     const { password, ...userData } = user.toObject();
//     res.json(userData);
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

export default router;
