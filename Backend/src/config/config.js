import * as admin from "firebase-admin";
import serviceAccount from "./liion-carpoolapp-firebase-adminsdk.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
