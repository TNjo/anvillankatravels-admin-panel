const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

const OLD_PARENT = "Luxury Holidays Classic Sri Lanka";
const NEW_PARENT = "Cultural and Classic";

async function fix() {
  const snapshot = await db.collection("tours").where("parentTourName", "==", OLD_PARENT).get();
  console.log(`Found ${snapshot.size} sub-packages to update...`);

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { parentTourName: NEW_PARENT });
    console.log(`  Updating: ${doc.data().name}`);
  });

  await batch.commit();
  console.log("Done! parentTourName updated to:", NEW_PARENT);
  process.exit(0);
}

fix().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
