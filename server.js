import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }



  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    text: message,
      html: `
    <h1>Thank you for your order!</h1>
    <p>We appreciate your purchase. Your order will be shipped soon.</p>
  `,
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
  console.error("Full error:", error);
if (error.response) {
  console.error("SendGrid Response Error:", error.response.body);
}
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
