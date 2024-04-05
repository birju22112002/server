/** @format */

import express from "express";
import {
  signup,
  signin,
  forgotPassword,
  resetPassword,
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

export default router;
