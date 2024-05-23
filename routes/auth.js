/** @format */

import express from "express";
import { requireSignin, isAdmin, isAuthor } from "../middlewares";

import {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  currentUser,
  createUser,
  users,
  deleteUser,
  // updateUser,
  currentUserProfile,
  updateUserProfile,
  updateUserByAdmin,
  getUserById,
} from "../controllers/auth";

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    data: "hello world ",
  });
});

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/pages/forgot", forgotPassword);
router.post("/pages/reset-password", resetPassword);

router.get("/current-admin", requireSignin, isAdmin, currentUser);
router.get("/current-author", requireSignin, isAuthor, currentUser);
router.get("/current-subscriber", requireSignin, currentUser);
router.get("/current-user", requireSignin, currentUserProfile);
router.get("/current-user/:userId", currentUserProfile);

//create-user

router.post("/create-user", requireSignin, createUser);

// requireSignin
// isAdmin
router.get("/users", users);
router.get("/user/:userId", currentUserProfile);
router.delete("/users/:userId", requireSignin, isAdmin, deleteUser);

router.get("/user/:userId", getUserById);

router.put("/update-user", requireSignin, updateUserProfile);
router.put("/update-user-by-admin", requireSignin, updateUserByAdmin);

export default router;
// module.exports = router;
