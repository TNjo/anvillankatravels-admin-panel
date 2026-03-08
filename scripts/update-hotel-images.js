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

// Beautiful hotel images from Unsplash (free to use)
// Using the same images for all hotels for now as requested
const sharedImages = {
  hero: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
  ],
  rooms: {
    deluxe: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    superior: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    suite: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
  },
};

function getRoomImage(roomName, index) {
  const name = roomName.toLowerCase();
  if (name.includes("suite") || name.includes("chalet")) return sharedImages.rooms.suite;
  if (name.includes("superior") || name.includes("lake") || name.includes("pool")) return sharedImages.rooms.superior;
  if (index % 2 === 0) return sharedImages.rooms.deluxe;
  return sharedImages.rooms.superior;
}

async function updateHotelImages() {
  console.log("Updating hotel images with Unsplash photos...\n");

  const snapshot = await db.collection("hotels").get();
  const batch = db.batch();
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const hotel = doc.data();

    // Update room types with images
    const updatedRoomTypes = (hotel.roomTypes || []).map((room, idx) => ({
      ...room,
      image: getRoomImage(room.name, idx),
    }));

    batch.update(doc.ref, {
      heroImage: sharedImages.hero,
      galleryImages: sharedImages.gallery,
      roomTypes: updatedRoomTypes,
      updatedAt: new Date().toISOString(),
    });
    updatedCount++;
    console.log(`  Updated: ${hotel.name} (hero + ${sharedImages.gallery.length} gallery + ${updatedRoomTypes.length} room images)`);
  }

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`\nSuccessfully updated ${updatedCount} hotels with proper hotel images!`);
  }

  process.exit(0);
}

updateHotelImages().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
