import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.API_KEY)),
});

export const db = admin.firestore();
export const auth = admin.auth();
export const { FieldValue } = require("@google-cloud/firestore");
export const fcm = admin.messaging()
