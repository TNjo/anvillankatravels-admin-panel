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

const familyRoomImage = "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80";

// Family room descriptions tailored per hotel type
const familyRoomDescriptions = {
  "Sigiri Asna Nature Resort": "Spacious family room with two double beds, garden views, a children's play corner, and a connecting bathroom — perfect for families exploring the cultural triangle.",
  "Skyloft Hotel": "Comfortable family room with twin and double bed setup, city views, kid-friendly amenities, and extra living space for the whole family.",
  "Mandara Resort": "Beachfront family room with twin and double beds, ocean views, a small sitting area, and easy access to the pool and beach activities.",
  "Lynden Grove Hotel": "Cozy family room with warm furnishings, mountain views, two beds, extra blankets for the cool hill country climate, and a spacious bathroom.",
  "O2 Ella": "Family room with panoramic mountain views, twin and double bed arrangement, a private balcony, and plenty of space for families to relax.",
  "Ruvisha Beach Hotel": "Family-friendly room with sea views, twin and double beds, air conditioning, and convenient access to the beach and pool.",
  "Kithala Resort": "Safari-themed family room with nature views, two beds, a private veranda — ideal for families on wildlife adventures in Yala.",
  "Randiya Sea View": "Comfortable family room with ocean views, twin and double beds, a private balcony, and a cozy seating area for the family.",
  "Radisson Blu Hotel": "Elegantly appointed family room with premium twin and double beds, marble bathroom, ocean or garden views, and complimentary kids' amenities.",
  "Insight Resort": "Tropical family room with garden views, twin and double beds, air conditioning, and direct access to the pool and garden area.",
};

async function addFamilyRoom() {
  console.log("Adding Family Room type to all hotels...\n");

  const snapshot = await db.collection("hotels").get();
  const batch = db.batch();
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const hotel = doc.data();
    const roomTypes = hotel.roomTypes || [];

    // Skip if Family Room already exists
    if (roomTypes.some((r) => r.name.toLowerCase().includes("family"))) {
      console.log(`  Skipped: ${hotel.name} (already has Family Room)`);
      continue;
    }

    const description = familyRoomDescriptions[hotel.name] ||
      "Spacious family room with twin and double beds, modern amenities, and plenty of space for the whole family to relax.";

    roomTypes.push({
      name: "Family Room",
      description,
      image: familyRoomImage,
    });

    batch.update(doc.ref, {
      roomTypes,
      updatedAt: new Date().toISOString(),
    });
    updatedCount++;
    console.log(`  Added Family Room to: ${hotel.name}`);
  }

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`\nSuccessfully added Family Room to ${updatedCount} hotels!`);
  } else {
    console.log("\nNo hotels needed updating.");
  }

  process.exit(0);
}

addFamilyRoom().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
