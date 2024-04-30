/** @format */
import User from "../models/user";
import { hashPassword, comparePassword } from "../helpers/auth";
import { sendNewUserEmail } from "../helpers/email";

import jwt from "jsonwebtoken";
import nanoid from "nanoid";
import { sendResetCodeEmail } from "../helpers/email";
export const signup = async (req, res) => {
  console.log("HIT SIGNUP");
  try {
    // validation
    const { name, email, password } = req.body;
    if (!name) {
      return res.json({
        error: "Name is required",
      });
    }
    if (!email) {
      return res.json({
        error: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken",
      });
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    try {
      const user = await new User({
        name,
        email,
        password: hashedPassword,
      }).save();

      // create signed token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      const { password: _, ...rest } = user.toObject();
      return res.status(201).json({
        token,
        user: rest,
      });
    } catch (error) {
      console.error("Error in signup:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (err) {
    console.log(err);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log("USER ===> ", user);
  if (!user) {
    return res.json({ error: "User not found" });
  }
  // generate code
  const resetCode = nanoid(5).toUpperCase();
  // save to db
  user.resetCode = resetCode;
  await user.save();

  // Send the reset code email
  const emailSent = await sendResetCodeEmail(email, resetCode);
  if (emailSent) {
    return res.json({ ok: true });
  } else {
    return res.json({ ok: false });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create and return JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Exclude password from user data
    const { password: _, ...userData } = user.toObject();

    res.json({ token, user: userData });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, resetCode, password } = req.body;
  try {
    // Find user by email and reset code
    const user = await User.findOne({ email, resetCode });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const currentUser = async (req, res) => {
  try {
    // const user = await User.findById(req.user._id);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, checked, website } = req.body;

    // Validation
    if (!name) {
      return res.json({
        error: "Name is required",
      });
    }
    if (!email) {
      return res.json({
        error: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }

    // Check if user exists
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ error: "Email is taken" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // If checked, send email with login details
    if (checked) {
      // Prepare email content
      const emailContent = `
        <h1>Hi ${name}</h1>
        <p>Your Wordpress account has been created successfully.</p>
        <h3>Your login details</h3>
        <p style="color:red;">Email: ${email}</p>
        <p style="color:red;">Password: ${password}</p>
        <small>We recommend you to change your password after login.</small>
      `;

      try {
        const emailSent = await sendNewUserEmail(
          email,
          "Account created",
          emailContent
        );
        if (emailSent) {
          console.log("Email sent successfully");
        } else {
          console.log("Email sending failed");
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Email sending failed" });
      }
    }

    // Create new user
    const user = await new User({
      name,
      email,
      password: hashedPassword,
      role,
      website,
    }).save();

    const { password: _, ...rest } = user.toObject();
    return res.status(201).json(rest);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const users = async (req, res) => {
  try {
    const all = await User.find().select("-password -secret -resetCode");
    res.json(all);
  } catch (err) {
    console.log(err);
  }
};
