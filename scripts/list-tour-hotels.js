const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore(app);

(async () => {
  const hotels = await db.collection("hotels").get();
  console.log("=== HOTELS ===");
  hotels.docs.forEach((d) => console.log(d.id, "-", d.data().name, "(", d.data().location, ")"));

  console.log("\n=== TOURS WITH HOTEL ASSIGNMENTS ===");
  const tours = await db.collection("tours").get();
  tours.docs.forEach((d) => {
    const t = d.data();
    if (!t.itinerary) return;
    console.log("\n" + t.name + ":");
    t.itinerary.forEach((day) => {
      console.log("  Day", day.day, "-", day.location, "| Hotel:", day.accommodation || "none", "| ID:", day.hotelId || "none");
    });
  });
  process.exit(0);
})();
