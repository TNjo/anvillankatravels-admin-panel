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

// Map of hotel locations to IDs (from Firestore)
const HOTEL_IDS = {
  "Sigiri Asna Nature Resort": "lcqNMFjJAKL5gNQYwy70",
  "Skyloft Hotel": "uggbaHVgQ47WkKFe0lfO",
  "Mandara Resort": "wDckAW8uwdPqdcBnYxoA",
  "Lynden Grove Hotel": "yzgVbiZZ9mRin8PwOzqx",
  "O2 Ella": "QNXVNmhLYGELzBxkntsv",
  "Ruvisha Beach Hotel": "beqpzukJLowW07Mj5Han",
  "Kithala Resort": "UugVeZANPIgiP9izVUtY",
  "Randiya Sea View": "Q8qR18Bb41oUwW9KKXFR",
  "Radisson Blu Hotel": "jwfCIlXKwr6sU5xSfT6v",
  "Insight Resort": "ZqlT60zVfAmHrUVFIpsH",
};

// For each location, define which hotels are alternatives (2-3 per location)
const locationHotels = {
  Sigiriya: ["lcqNMFjJAKL5gNQYwy70", "UugVeZANPIgiP9izVUtY"],  // Sigiri Asna + Kithala (nature)
  Kandy: ["uggbaHVgQ47WkKFe0lfO", "yzgVbiZZ9mRin8PwOzqx"],      // Skyloft + Lynden Grove
  "South Coast": ["wDckAW8uwdPqdcBnYxoA", "Q8qR18Bb41oUwW9KKXFR", "ZqlT60zVfAmHrUVFIpsH"], // Mandara + Randiya + Insight
  Galle: ["jwfCIlXKwr6sU5xSfT6v", "ZqlT60zVfAmHrUVFIpsH"],       // Radisson + Insight
  Mirissa: ["wDckAW8uwdPqdcBnYxoA", "Q8qR18Bb41oUwW9KKXFR"],     // Mandara + Randiya
  "Nuwara Eliya": ["yzgVbiZZ9mRin8PwOzqx", "QNXVNmhLYGELzBxkntsv"], // Lynden Grove + O2 Ella
  Ella: ["QNXVNmhLYGELzBxkntsv", "yzgVbiZZ9mRin8PwOzqx"],         // O2 Ella + Lynden Grove
  "Yala / Mirissa": ["UugVeZANPIgiP9izVUtY", "wDckAW8uwdPqdcBnYxoA", "Q8qR18Bb41oUwW9KKXFR"], // Kithala + Mandara + Randiya
  Yala: ["UugVeZANPIgiP9izVUtY", "wDckAW8uwdPqdcBnYxoA"],         // Kithala + Mandara
  Negombo: ["beqpzukJLowW07Mj5Han", "jwfCIlXKwr6sU5xSfT6v"],     // Ruvisha + Radisson
};

async function migrateToMultiHotels() {
  console.log("Migrating tours to multi-hotel format...\n");

  const snapshot = await db.collection("tours").get();
  const batch = db.batch();
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const tour = doc.data();
    if (!tour.itinerary || !Array.isArray(tour.itinerary)) continue;

    let changed = false;
    const updatedItinerary = tour.itinerary.map((day) => {
      // Skip days with no hotel or last days (departure)
      if (!day.hotelId && !day.accommodation) return day;

      // Already has hotelIds
      if (day.hotelIds && day.hotelIds.length > 1) return day;

      // Find alternative hotels for this location
      const locHotels = locationHotels[day.location];
      if (locHotels && locHotels.length > 1) {
        changed = true;
        // Make sure the current hotel (if any) is first
        let ids = [...locHotels];
        if (day.hotelId && !ids.includes(day.hotelId)) {
          ids = [day.hotelId, ...ids.slice(0, 2)];
        } else if (day.hotelId) {
          // Move current hotel to front
          ids = [day.hotelId, ...ids.filter((id) => id !== day.hotelId)];
        }
        return {
          ...day,
          hotelIds: ids,
          hotelId: ids[0], // Keep backward compat
        };
      }

      // If single hotel, wrap in array
      if (day.hotelId && !day.hotelIds) {
        changed = true;
        return { ...day, hotelIds: [day.hotelId] };
      }

      return day;
    });

    if (changed) {
      batch.update(doc.ref, {
        itinerary: updatedItinerary,
        updatedAt: new Date().toISOString(),
      });
      updatedCount++;
      console.log(`  ${tour.name}:`);
      updatedItinerary.forEach((day) => {
        const ids = day.hotelIds || [];
        if (ids.length > 0) {
          console.log(`    Day ${day.day} (${day.location}): ${ids.length} hotels`);
        }
      });
    }
  }

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`\nSuccessfully migrated ${updatedCount} tours to multi-hotel format!`);
  } else {
    console.log("\nNo tours needed migration.");
  }

  process.exit(0);
}

migrateToMultiHotels().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
