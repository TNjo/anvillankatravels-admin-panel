const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
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

const PARENT_TOUR_NAME = "Cultural and Classic";

async function cleanup() {
  const allSnapshot = await db.collection("tours").get();
  const parentDoc = allSnapshot.docs.find(
    (doc) => doc.data().name === PARENT_TOUR_NAME && !doc.data().parentTourName
  );

  if (!parentDoc) {
    console.error(`Parent tour "${PARENT_TOUR_NAME}" not found!`);
    process.exit(1);
  }

  const data = parentDoc.data();
  console.log(`Found parent tour: ${data.name} (${parentDoc.id})`);
  console.log(`  Current duration: ${data.duration?.days} days / ${data.duration?.nights} nights`);
  console.log(`  Current itinerary days: ${data.itinerary?.length || 0}`);
  console.log(`  Current places to stay: ${data.placesToStay?.length || 0}`);

  // Remove old itinerary, duration, placesToStay, and highlights from the parent
  await parentDoc.ref.update({
    duration: { days: 0, nights: 0 },
    itinerary: FieldValue.delete(),
    placesToStay: FieldValue.delete(),
    highlights: FieldValue.delete(),
    updatedAt: new Date().toISOString(),
  });

  console.log("\nCleaned up parent tour:");
  console.log("  - Set duration to 0/0");
  console.log("  - Removed itinerary");
  console.log("  - Removed placesToStay");
  console.log("  - Removed highlights");
  console.log("\nDone!");
  process.exit(0);
}

cleanup().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
