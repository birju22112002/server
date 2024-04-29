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

//create-user

router.post("/create-user", requireSignin, isAdmin, createUser);

export default router;
// module.exports = router;
