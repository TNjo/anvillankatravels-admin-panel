const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const fs = require("fs");
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
const storage = getStorage(app);
const bucket = storage.bucket();

const ASSETS_DIR = path.resolve(__dirname, "../../dream-sri-lanka-planner/src/assets");

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const IMAGE_MAP = {
  // ========== TOUR 1: luxury-classic-sri-lanka (Package 1) ==========
  "/images/tours/luxury-classic/sigiriya.jpg": "Package 1/sigiriya.jpg",
  "/images/tours/luxury-classic/negombo.jpg": "Package 1/Negambo.jpg",
  "/images/tours/luxury-classic/negombo-to-anuradhapura.png": "Package 1/Negambo to anuradhapura.png",
  "/images/tours/luxury-classic/anuradhapura.jpg": "Package 1/Anuradhapura.jpg",
  "/images/tours/luxury-classic/kandy.jpg": "Package 1/Kandy.jpg",
  "/images/tours/luxury-classic/tea-country.jpg": "Package 1/Tea country.jpg",
  "/images/tours/luxury-classic/tea-factory.jpg": "Package 1/Tea factory.jpg",
  "/images/tours/luxury-classic/tea-factory-1.jpg": "Package 1/Tea factory1.jpg",
  "/images/tours/luxury-classic/rawana-ella.jpg": "Package 1/Rawana ella.jpg",
  "/images/tours/luxury-classic/yala-safari.jpg": "Package 1/yala safari 5.jpg",
  "/images/tours/luxury-classic/yala-safari-kotiya.jpg": "Package 1/Yala safari kotiya.jpg",
  "/images/tours/luxury-classic/yala-safari-wadura.jpg": "Package 1/Yala safari wadura.jpg",
  "/images/tours/luxury-classic/matara.jpg": "Package 1/MATARA.jpg",
  "/images/tours/luxury-classic/galle-fort.jpg": "Package 1/galle_fort.jpg",
  "/images/tours/luxury-classic/galle.png": "Package 1/galle.png",
  "/images/tours/luxury-classic/colombo.jpeg": "Package 1/colombo.jpeg",

  // ========== TOUR 2: luxury-wild-holidays (package02) ==========
  "/images/tours/luxury-wild/leopard-tree.jpg": "leopard-tree.jpg",
  "/images/tours/luxury-wild/negombo.jpg": "package02/negombo.jpg",
  "/images/tours/luxury-wild/millennium-elephant.jpeg": "package02/millenium-elephant.jpeg",
  "/images/tours/luxury-wild/temple-of-tooth.jpeg": "package02/templeoftooth.jpeg",
  "/images/tours/luxury-wild/kandy-to-koslanda.jpg": "package02/nuwra-eliya.webp",
  "/images/tours/luxury-wild/koslanda.jpg": "package02/koslanda.jpg",
  "/images/tours/luxury-wild/buduruwagala.jpg": "package02/buduruwagala.jpg",
  "/images/tours/luxury-wild/yala-1.jpg": "package02/yala1.jpg",
  "/images/tours/luxury-wild/yala-2.jpg": "package02/yala2.jpg",
  "/images/tours/luxury-wild/yala-3.jpg": "package02/yala3.jpg",
  "/images/tours/luxury-wild/koggala.jpg": "package02/koggala.jpg",
  "/images/tours/luxury-wild/sinharaja.jpg": "package02/sinharaja.jpg",
  "/images/tours/luxury-wild/cycling.jpg": "package02/cycling.jpg",
  "/images/tours/luxury-wild/koggala-2.jpg": "package02/koggala2.jpg",
  "/images/tours/luxury-wild/galle-fort.jpeg": "package02/galle-fort.jpeg",
  "/images/tours/luxury-wild/turtles.jpg": "package02/turtles.jpg",

  // ========== TOUR 3: luxury-honeymoon (Package 3) ==========
  "/images/tours/honeymoon/mirissa.jpg": "Package 3/Mirissa.jpg",
  "/images/tours/honeymoon/arrival.jpg": "Package 3/Arrival.jpg",
  "/images/tours/honeymoon/negombo.jpg": "Package 3/Negambo.jpg",
  "/images/tours/honeymoon/exploring-kandy.jpg": "Package 3/Exploring Kandy.jpg",
  "/images/tours/honeymoon/kandy.jpg": "Package 3/Kandy.jpg",
  "/images/tours/honeymoon/kandy-to-koslanda.jpg": "Package 3/From Kandy to Koslanda.jpg",
  "/images/tours/honeymoon/koslanda.jpg": "Package 3/Koslanda.jpg",
  "/images/tours/honeymoon/yala-national-park.jpg": "Package 3/Yala National Park.jpg",
  "/images/tours/honeymoon/yala-safari-1.jpg": "Package 3/Yala Safari 1.jpg",
  "/images/tours/honeymoon/yala-safari-2.jpg": "Package 3/Yala Safari 2.jpg",
  "/images/tours/honeymoon/mirissa-2.jpg": "Package 3/Mirissa 2.jpg",
  "/images/tours/honeymoon/mirissa-3.jpg": "Package 3/Mirissa 3.jpg",
  "/images/tours/honeymoon/mirissa-4.jpg": "Package 3/Mirissa 4.jpg",
  "/images/tours/honeymoon/departure.webp": "Package 3/Departure.webp",

  // ========== TOUR 4: discover-luxury-secret (root assets) ==========
  "/images/tours/luxury-secret/sigiriya-sunset.jpg": "sigiriya-sunset.jpg",
  "/images/tours/luxury-secret/kalpitiya-beach-sunset.jpg": "kalpitiya-beach-sunset.jpg",
  "/images/tours/luxury-secret/leopard-tree.jpg": "leopard-tree.jpg",
  "/images/tours/luxury-secret/elephants-herd.jpg": "elephants-herd.jpg",
  "/images/tours/luxury-secret/sigiriya-sunset-2.jpg": "sigiriya-sunset.jpg",
  "/images/tours/luxury-secret/kalpitiya-beach-2.jpg": "kalpitiya-beach-sunset.jpg",
  "/images/tours/luxury-secret/snorkeling-reef.jpg": "snorkeling-reef.jpg",
  "/images/tours/luxury-secret/kalpitiya-beach-3.jpg": "kalpitiya-beach-sunset.jpg",
  "/images/tours/luxury-secret/kalpitiya-beach-4.jpg": "kalpitiya-beach-sunset.jpg",
  "/images/tours/luxury-secret/kalpitiya-beach-5.jpg": "kalpitiya-beach-sunset.jpg",

  // ========== TOUR 5: tea-plantations-coastal (package 5) ==========
  "/images/tours/tea-coastal/tea-country.jpg": "package 5/Tea Country.jpg",
  "/images/tours/tea-coastal/arrival.jpg": "package 5/Arrival.jpg",
  "/images/tours/tea-coastal/thirappane.jpg": "package 5/Thirappane - Cultural Triangle.jpg",
  "/images/tours/tea-coastal/minneriya.webp": "package 5/Minneriya.webp",
  "/images/tours/tea-coastal/kandy.jpg": "package 5/Kandy.jpg",
  "/images/tours/tea-coastal/hatton.jpg": "package 5/Hatton.jpg",
  "/images/tours/tea-coastal/tangalle.webp": "package 5/Tangalle.webp",
  "/images/tours/tea-coastal/tangalle-1.jpg": "package 5/Tangalle 1.jpg",
  "/images/tours/tea-coastal/galle.jpg": "package 5/galle.jpg",
  "/images/tours/tea-coastal/departure.jpg": "package 5/Depature.jpg",

  // ========== HOTELS (Package 1) ==========
  "/images/hotels/walawwa-hotel.jpg": "Package 1/Hotel/Walawwa-hotel.jpg",
  "/images/hotels/ulagalla-resort.png": "Package 1/Hotel/ulagale-resort.png",
  "/images/hotels/kandy-house.jpg": "Package 1/Hotel/the-kandy-house.jpg",
  "/images/hotels/ceylon-tea-trails.png": "Package 1/Hotel/Ceylon-Tea-Trails.png",
  "/images/hotels/ruhunu-yala-safari.jpg": "Package 1/Hotel/Ruhunu yala safari.jpg",
  "/images/hotels/kahanda-kanda.webp": "Package 1/Hotel/Kahanda-Kanda.webp",

  // ========== HOTELS (package02) ==========
  "/images/hotels/walawwa.jpg": "package02/476230379.jpg",
  "/images/hotels/polawaththa.jpg": "package02/polawaththa.jpg",
  "/images/hotels/living-heritage.jpg": "package02/livingHeritage.jpg",
  "/images/hotels/ruhunu-safari.jpg": "package02/ruhunusafari.jpg",
  "/images/hotels/tri-lanka.jpg": "package02/tri.jpg",

  // ========== HOTELS (Package 3) ==========
  "/images/hotels/walawwa-hotel-pkg3.jpg": "Package 3/Hotel/Walawwa-hotel.jpg",
  "/images/hotels/kandy-house-pkg3.jpg": "Package 3/Hotel/the-kandy-house.jpg",
  "/images/hotels/living-heritage-koslanda-pkg3.webp": "Package 3/Hotel/Living Heritage Koslanda.webp",
  "/images/hotels/ruhunu-yala-safari-pkg3.jpg": "Package 3/Hotel/Ruhunu yala safari.jpg",
  "/images/hotels/lantern-boutique-hotel.jpg": "Package 3/Hotel/Lantern Boutique Hotel.jpg",

  // ========== HOTELS (package 5) ==========
  "/images/hotels/walawwa-hotel-pkg5.jpg": "package 5/Hotel/Walawwa-hotel.jpg",
  "/images/hotels/ulagalla-resort-pkg5.png": "package 5/Hotel/ulagale-resort.png",
  "/images/hotels/kandy-house-pkg5.jpg": "package 5/Hotel/the-kandy-house.jpg",
  "/images/hotels/ceylon-tea-trails-pkg5.png": "package 5/Hotel/Ceylon-Tea-Trails.png",
  "/images/hotels/anantara-peace-haven.jpg": "package 5/Hotel/Anantara Peace Haven Resort.jpg",
  "/images/hotels/amangalla.webp": "package 5/Hotel/Amangalla.webp",

  // ========== DAY TOURS ==========
  "/images/day-tours/colombo/buddha-reflection.jpg": "buddha-reflection.jpg",
  "/images/day-tours/colombo/elephants-herd.jpg": "elephants-herd.jpg",
  "/images/day-tours/colombo/sigiriya-sunset.jpg": "sigiriya-sunset.jpg",
  "/images/day-tours/kandy/buddha-reflection.jpg": "buddha-reflection.jpg",
  "/images/day-tours/kandy/tea-plantation-aerial.jpg": "tea-plantation-aerial.jpg",
  "/images/day-tours/kandy/tropical-waterfall.jpg": "tropical-waterfall.jpg",
  "/images/day-tours/galle/kalpitiya-beach-sunset.jpg": "kalpitiya-beach-sunset.jpg",
  "/images/day-tours/galle/surfing-waves.jpg": "surfing-waves.jpg",
  "/images/day-tours/galle/snorkeling-reef.jpg": "snorkeling-reef.jpg",
  "/images/day-tours/yala/leopard-tree.jpg": "leopard-tree.jpg",
  "/images/day-tours/yala/elephants-herd.jpg": "elephants-herd.jpg",
  "/images/day-tours/yala/tea-plantation-aerial.jpg": "tea-plantation-aerial.jpg",
  "/images/day-tours/sigiriya/sigiriya-sunset.jpg": "sigiriya-sunset.jpg",
  "/images/day-tours/sigiriya/buddha-reflection.jpg": "buddha-reflection.jpg",
  "/images/day-tours/sigiriya/tea-plantation-aerial.jpg": "tea-plantation-aerial.jpg",
  "/images/day-tours/kitulgala/tropical-waterfall.jpg": "tropical-waterfall.jpg",
  "/images/day-tours/kitulgala/tea-plantation-aerial.jpg": "tea-plantation-aerial.jpg",
  "/images/day-tours/kitulgala/train-scenic.jpg": "train-scenic.jpg",
};

async function uploadFile(localPath, storagePath) {
  const ext = path.extname(localPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  const fileBuffer = fs.readFileSync(localPath);
  const file = bucket.file(storagePath);

  await file.save(fileBuffer, {
    metadata: { contentType },
    public: true,
  });

  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}

async function main() {
  console.log("=== Firebase Storage Image Upload Script ===\n");

  const urlMap = {};
  const uploaded = new Set();
  let uploadCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  const entries = Object.entries(IMAGE_MAP);
  console.log(`Found ${entries.length} image mappings to process.\n`);

  for (const [seedPath, localRelPath] of entries) {
    const localFile = path.join(ASSETS_DIR, localRelPath);

    if (!fs.existsSync(localFile)) {
      console.log(`  SKIP (not found): ${localRelPath}`);
      skipCount++;
      continue;
    }

    const storagePath = `images${seedPath}`;

    if (uploaded.has(storagePath)) {
      urlMap[seedPath] = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
      console.log(`  CACHED: ${seedPath}`);
      continue;
    }

    try {
      const url = await uploadFile(localFile, storagePath);
      urlMap[seedPath] = url;
      uploaded.add(storagePath);
      uploadCount++;
      console.log(`  UPLOADED (${uploadCount}): ${localRelPath} -> ${storagePath}`);
    } catch (err) {
      console.error(`  ERROR: ${localRelPath}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n--- Upload Summary ---`);
  console.log(`  Uploaded: ${uploadCount}`);
  console.log(`  Skipped:  ${skipCount}`);
  console.log(`  Errors:   ${errorCount}`);
  console.log(`  URL Map:  ${Object.keys(urlMap).length} entries\n`);

  // Now update Firestore documents
  console.log("=== Updating Firestore Documents ===\n");

  function replaceUrl(value) {
    if (typeof value === "string" && urlMap[value]) {
      return urlMap[value];
    }
    return value;
  }

  function replaceAllUrls(obj) {
    if (typeof obj === "string") return replaceUrl(obj);
    if (Array.isArray(obj)) return obj.map((item) => replaceAllUrls(item));
    if (obj && typeof obj === "object") {
      const result = {};
      for (const [key, val] of Object.entries(obj)) {
        result[key] = replaceAllUrls(val);
      }
      return result;
    }
    return obj;
  }

  // Update tours
  const toursSnap = await db.collection("tours").get();
  let tourUpdates = 0;
  for (const doc of toursSnap.docs) {
    const data = doc.data();
    const updated = replaceAllUrls(data);
    if (JSON.stringify(data) !== JSON.stringify(updated)) {
      await db.collection("tours").doc(doc.id).update(updated);
      tourUpdates++;
      console.log(`  Updated tour: ${doc.id}`);
    }
  }

  // Update day tours
  const dayToursSnap = await db.collection("dayTours").get();
  let dayTourUpdates = 0;
  for (const doc of dayToursSnap.docs) {
    const data = doc.data();
    const updated = replaceAllUrls(data);
    if (JSON.stringify(data) !== JSON.stringify(updated)) {
      await db.collection("dayTours").doc(doc.id).update(updated);
      dayTourUpdates++;
      console.log(`  Updated day tour: ${doc.id}`);
    }
  }

  console.log(`\n--- Firestore Update Summary ---`);
  console.log(`  Tours updated:     ${tourUpdates}`);
  console.log(`  Day tours updated: ${dayTourUpdates}`);
  console.log(`\nDone! All images are now served from Firebase Storage.`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
