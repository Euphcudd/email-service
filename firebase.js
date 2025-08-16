import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Read the service account JSON dynamically
const serviceAccountPath = path.resolve("./serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const messaging = admin.messaging();