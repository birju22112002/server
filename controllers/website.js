/** @format */

// Import the necessary function from the helper
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
