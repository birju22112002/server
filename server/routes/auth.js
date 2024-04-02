/** @format */

import express from "express";

const router = express.Router();

// controllers
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

router.get("/", (req, res) => {
  return res.json({
    data: "hello world ",
  });
});
router.post("/pages/signup", signup);
router.post("/pages/signin", signin);
router.post("/pages/forgot", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
