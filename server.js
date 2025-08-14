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
  const { 
    to, 
    customerName, 
    orderId, 
    items, 
    total, 
    trackingId 
  } = req.body;

  // Validate
  if (!to || !customerName || !orderId || !items || !total || !trackingId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const msg = {
    to,
    from: {
      email: process.env.FROM_EMAIL,
      name: "RETRO FIFTY"
    },
    subject: "Your Order Has Been Shipped!",
    template_id: "d-fb8e666ee1de42afa9133334b1cd038a", // your template ID
    dynamic_template_data: {
      customerName,
      orderId,
      items,
      total,
      trackingId,
      unsubscribe: "https://example.com/unsubscribe",
      unsubscribe_preferences: "https://example.com/preferences"
    }
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
