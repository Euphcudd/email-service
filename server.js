// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import sgMail from "@sendgrid/mail";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Set SendGrid API Key
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// app.post("/send-email", async (req, res) => {
//   const { 
//     to, 
//     customerName, 
//     orderId, 
//     items, 
//     subtotal,
//     deliveryCharge,
//     total, 
//     trackingId,
//     customerAddressLine1,
  
//   } = req.body;

//   // Validate required fields
//   if (!to || !customerName || !orderId || !items || !total || !trackingId) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const msg = {
//     to,
//     from: {
//       email: process.env.FROM_EMAIL,
//       name: "RETRO FIFTY"
//     },
//     subject: "Your Order Has Been Shipped!",
//     template_id: "d-fb8e666ee1de42afa9133334b1cd038a",
//     dynamic_template_data: {
//       customerName,
//       orderId,
//       items,
//       subtotal,
//       deliveryCharge,
//       total,
//       trackingId,
//       customerAddressLine1,
     
//       unsubscribe: "https://example.com/unsubscribe",
//       unsubscribe_preferences: "https://example.com/preferences"
//     }
//   };

//   try {
//     await sgMail.send(msg);
//     res.json({ success: true, message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Full error:", error);
//     if (error.response) {
//       console.error("SendGrid Response Error:", error.response.body);
//     }
//     res.status(500).json({ success: false, error: error.message });
//   }
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import { db, messaging } from "./firebase.js"; // <-- import Firebase Admin here

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
// Initialize SendGrid
// ----------------------
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ----------------------
// Firestore listener for new orders with status "placed"
// ----------------------
db.collection("orders")
  .where("status", "==", "placed")
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const orderId = change.doc.id;
        console.log("New order placed:", orderId);

        // Send push notification
        sendOrderPushNotification(orderId);
      }
    });
  });

// ----------------------
// Function to send push notifications
// ----------------------
async function sendOrderPushNotification(orderId) {
  try {
    const tokensSnapshot = await db.collection("adminTokens").get();
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    if (!tokens.length) return;

    const message = {
      notification: {
        title: "New Order Placed",
        body: `Order #${orderId} has been placed.`,
      },
      tokens,
    };

    const response = await messaging.sendMulticast(message);
    console.log(`Push notifications sent: ${response.successCount}`);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

// ----------------------
// SendGrid email route
// ----------------------
app.post("/send-email", async (req, res) => {
  const { 
    to, 
    customerName, 
    orderId, 
    items, 
    subtotal,
    deliveryCharge,
    total, 
    trackingId,
    customerAddressLine1,
  } = req.body;

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
    template_id: "d-fb8e666ee1de42afa9133334b1cd038a",
    dynamic_template_data: {
      customerName,
      orderId,
      items,
      subtotal,
      deliveryCharge,
      total,
      trackingId,
      customerAddressLine1,
      unsubscribe: "https://example.com/unsubscribe",
      unsubscribe_preferences: "https://example.com/preferences"
    }
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Full error:", error);
    if (error.response) console.error("SendGrid Response Error:", error.response.body);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------
// Start Express server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));