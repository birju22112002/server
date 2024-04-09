/** @format */

import express from "express";
import { requireSignin, isAdmin } from "../middlewares";
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  currentUser,
} = require("../controllers/auth");

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

export default router;
// module.exports = router;
