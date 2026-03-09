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

// TripAdvisor (out of 5) and Booking.com (out of 10) ratings per hotel
const hotelRatings = {
  "Sigiri Asna Nature Resort": {
    tripAdvisorRating: 4.0,
    tripAdvisorReviews: 185,
    bookingComRating: 8.2,
    bookingComReviews: 142,
  },
  "Skyloft Hotel": {
    tripAdvisorRating: 4.0,
    tripAdvisorReviews: 210,
    bookingComRating: 8.0,
    bookingComReviews: 178,
  },
  "Mandara Resort": {
    tripAdvisorRating: 4.5,
    tripAdvisorReviews: 520,
    bookingComRating: 8.7,
    bookingComReviews: 385,
  },
  "Lynden Grove Hotel": {
    tripAdvisorRating: 4.0,
    tripAdvisorReviews: 145,
    bookingComRating: 7.9,
    bookingComReviews: 112,
  },
  "O2 Ella": {
    tripAdvisorRating: 4.0,
    tripAdvisorReviews: 290,
    bookingComRating: 8.3,
    bookingComReviews: 225,
  },
  "Ruvisha Beach Hotel": {
    tripAdvisorRating: 3.5,
    tripAdvisorReviews: 165,
    bookingComRating: 7.8,
    bookingComReviews: 130,
  },
  "Kithala Resort": {
    tripAdvisorRating: 4.5,
    tripAdvisorReviews: 410,
    bookingComRating: 8.5,
    bookingComReviews: 295,
  },
  "Randiya Sea View": {
    tripAdvisorRating: 4.0,
    tripAdvisorReviews: 175,
    bookingComRating: 8.1,
    bookingComReviews: 148,
  },
  "Radisson Blu Hotel": {
    tripAdvisorRating: 4.5,
    tripAdvisorReviews: 1250,
    bookingComRating: 9.0,
    bookingComReviews: 980,
  },
  "Insight Resort": {
    tripAdvisorRating: 4.5,
    tripAdvisorReviews: 340,
    bookingComRating: 8.6,
    bookingComReviews: 270,
  },
};

async function addHotelRatings() {
  console.log("Adding TripAdvisor & Booking.com ratings to hotels...\n");

  const snapshot = await db.collection("hotels").get();
  const batch = db.batch();
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const hotel = doc.data();
    const ratings = hotelRatings[hotel.name];

    if (ratings) {
      batch.update(doc.ref, {
        ...ratings,
        updatedAt: new Date().toISOString(),
      });
      updatedCount++;
      console.log(`  ${hotel.name}: TA ${ratings.tripAdvisorRating}/5 (${ratings.tripAdvisorReviews}) | B.com ${ratings.bookingComRating}/10 (${ratings.bookingComReviews})`);
    } else {
      console.log(`  Skipped: ${hotel.name} (no rating data)`);
    }
  }

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`\nSuccessfully added ratings to ${updatedCount} hotels!`);
  }

  process.exit(0);
}

addHotelRatings().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
