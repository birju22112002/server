/** @format */

import Website from "../models/website";
import { sendNewUserEmail } from "E:\\b\\server\\helpers\\email";

export const contact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Prepare email data
    const subject = "Email received from contact form";
    const html = `
      <h3>Contact form message</h3>
      <p><b>Name </b>: ${name}</p>
      <p><b>Email </b>: ${email}</p>
      <p><b>Message </b>: ${message}</</p>
    `;

    // Send email using the helper function
    const emailSent = await sendNewUserEmail(
      process.env.EMAIL_FROM,
      subject,
      html
    );

    if (emailSent) {
      res.json({ ok: true });
    } else {
      res.status(500).json({ ok: false, error: "Failed to send email" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, error: "An error occurred. Please try again." });
  }
};

export const createPage = async (req, res) => {
  try {
    const { page, title, subtitle, fullWidthImage } = req.body;
    if (!page) {
      return res
        .status(400)
        .json({ ok: false, error: "Page field is required" });
    }

    const found = await Website.findOne({ page });

    if (found) {
      // Update
      const updated = await Website.findOneAndUpdate(
        { page },
        { title, subtitle, fullWidthImage },
        { new: true }
      );
      return res.json(updated);
    } else {
      // Create
      const created = await new Website({
        page,
        title,
        subtitle,
        fullWidthImage,
      }).save();
      return res.json(created);
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, error: "An error occurred. Please try again." });
  }
};

export const getPage = async (req, res) => {
  try {
    const { page } = req.params;
    const found = await Website.findOne({ page }).populate("fullWidthImage");
    return res.json(found);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ ok: false, error: "An error occurred. Please try again." });
  }
};
