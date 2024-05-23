/** @format */
import User from "../models/user";
import { hashPassword, comparePassword } from "../helpers/auth";
import { sendNewUserEmail } from "../helpers/email";
import emailValidator from "email-validator";

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
        <p>Your account has been created successfully.</p>
        <h3>Your login details</h3>
        <p>Email: ${email}</p>
        <p>Password: ${password}</p>
        <small>We recommend you to change your password after login.</small>
      `;

      try {
        const emailSent = await sendNewUserEmail(
          email,
          "Account created",
          emailContent
        ); // Use updated email sending function
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

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id) return;
    const user = await User.findByIdAndDelete(userId);
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id, name, email, password, website, image } = req.body;

    const userFromDb = await User.findById(id);
    if (!userFromDb) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userFromDb._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // check valid email
    if (!emailValidator.validate(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    // check if email is taken
    const exist = await User.findOne({ email });
    if (exist && exist._id.toString() !== userFromDb._id.toString()) {
      return res.status(400).json({ error: "Email is taken" });
    }

    // check password length
    if (password && password.length < 6) {
      return res.status(400).json({
        error: "Password is required and should be 6 characters long",
      });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updated = await User.findByIdAndUpdate(
      id,
      {
        name: name || userFromDb.name,
        email: email || userFromDb.email,
        password: hashedPassword || userFromDb.password,
        website: website || userFromDb.website,
        image: image || userFromDb.image,
      },
      { new: true }
    ).populate("image");
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const currentUserProfile = async (req, res) => {
  try {
    console.log("req.params.userId", req.params.userId);
    const user = await User.findById(req.params.userId).populate("image");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { id, name, email, password, website, role, image, checked } =
      req.body;

    const userFromDb = await User.findById(id);
    if (!userFromDb) {
      return res.status(404).json({ error: "User not found" });
    }

    // check valid email
    if (!emailValidator.validate(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    // check if email is taken
    const exist = await User.findOne({ email });
    if (exist && exist._id.toString() !== userFromDb._id.toString()) {
      return res.status(400).json({ error: "Email is taken" });
    }

    // check password length
    if (password && password.length < 6) {
      return res.status(400).json({
        error: "Password is required and should be 6 characters long",
      });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updated = await User.findByIdAndUpdate(
      id,
      {
        name: name || userFromDb.name,
        email: email || userFromDb.email,
        password: hashedPassword || userFromDb.password,
        website: website || userFromDb.website,
        role: role || userFromDb.role,
        image: image || userFromDb.image,
      },
      { new: true }
    ).populate("image");
    if (checked) {
      //send email
      const emailContent = `
        <h1>Hi ${name}</h1>
        <p>Your account has been updated successfully.</p>
        <h3>Your login details</h3>
        <p>Email: ${email}</p>
        <p>Password: ${password}</p>
        <small>We recommend you to change your password after login.</small>
      `;

      try {
        const emailSent = await sendNewUserEmail(
          email,
          "Account updated",
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

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id, name, email, password, website, image } = req.body;

    // Retrieve the user from the database
    const userFromDb = await User.findById(id);
    if (!userFromDb) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure that the user updating the profile is authorized
    if (userFromDb._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Validate email format
    if (!emailValidator.validate(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    // Check if the email is already taken by another user
    const exist = await User.findOne({ email });
    if (exist && exist._id.toString() !== userFromDb._id.toString()) {
      return res.status(400).json({ error: "Email is taken" });
    }

    // Check if a new password is provided and hash it
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Update the user's profile information
    const updated = await User.findByIdAndUpdate(
      id,
      {
        name: name || userFromDb.name,
        email: email || userFromDb.email,
        password: hashedPassword || userFromDb.password,
        website: website || userFromDb.website,
        image: image || userFromDb.image,
      },
      { new: true } // Return the updated document
    ).populate("image");

    // Return the updated user object
    res.json(updated);
  } catch (err) {
    console.error("Error in updateUserProfile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
