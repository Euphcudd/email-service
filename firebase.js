// Instead of:
// import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// Do this:
const serviceAccount = require("./serviceAccountKey.json");

// And if using ES module syntax elsewhere, you can still do:
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const messaging = admin.messaging();