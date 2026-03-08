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

// High-quality Unsplash hotel images - using same set for all hotels for now
const hotelImages = {
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
    family: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
  },
};

const hotels = [
  {
    name: "Sigiri Asna Nature Resort",
    location: "Sigiriya",
    category: "Nature Resort",
    starRating: 3,
    description:
      "Nestled in the lush greenery surrounding the iconic Sigiriya Rock Fortress, Sigiri Asna Nature Resort offers a tranquil escape into Sri Lanka's cultural heartland. The resort combines traditional Sri Lankan hospitality with modern comforts, featuring spacious rooms that open to stunning views of the surrounding countryside and the majestic Sigiriya Rock.\n\nGuests can enjoy authentic Sri Lankan cuisine prepared with locally sourced ingredients, take a refreshing dip in the outdoor pool, or simply relax in the beautifully landscaped gardens. The resort's prime location makes it an ideal base for exploring the cultural triangle, including Sigiriya, Dambulla, and Polonnaruwa.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Outdoor Swimming Pool",
      "Restaurant with Local Cuisine",
      "Free Wi-Fi",
      "Garden & Terrace",
      "Airport Transfer Service",
      "Tour Desk",
      "Free Parking",
      "Ayurvedic Spa",
      "Bicycle Rental",
      "Room Service",
    ],
    roomTypes: [
      {
        name: "Deluxe Double Room",
        description: "Spacious room with garden view, king-size bed, air conditioning, and en-suite bathroom with hot water.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Superior Twin Room",
        description: "Comfortable twin room with nature views, air conditioning, and private balcony overlooking the gardens.",
        image: hotelImages.rooms.superior,
      },
      {
        name: "Family Room",
        description: "Spacious family room with two double beds, garden views, a children's play corner, and a connecting bathroom — perfect for families exploring the cultural triangle.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Sigiriya Rock Fortress", distance: "3 km", duration: "5 min" },
      { place: "Dambulla Cave Temple", distance: "17 km", duration: "25 min" },
      { place: "Minneriya National Park", distance: "20 km", duration: "30 min" },
      { place: "Polonnaruwa", distance: "60 km", duration: "1 hr" },
      { place: "Bandaranaike International Airport", distance: "170 km", duration: "4 hr" },
    ],
    mapCoordinates: { lat: 7.957, lng: 80.7603 },
  },
  {
    name: "Skyloft Hotel",
    location: "Kandy",
    category: "City Hotel",
    starRating: 3,
    description:
      "Skyloft Hotel is a modern boutique hotel located in the heart of Kandy, Sri Lanka's cultural capital. Perched on a hillside, the hotel offers panoramic views of the city, Kandy Lake, and the surrounding mountains. The hotel provides comfortable and stylishly appointed rooms with contemporary amenities.\n\nIts central location places guests within easy reach of Kandy's top attractions, including the Temple of the Tooth Relic, the Royal Botanical Gardens at Peradeniya, and the vibrant Kandy city market. The rooftop restaurant offers a dining experience with stunning views over the city.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Rooftop Restaurant",
      "City & Mountain Views",
      "Free Wi-Fi",
      "Air Conditioning",
      "24-Hour Reception",
      "Laundry Service",
      "Tour Desk",
      "Free Parking",
      "Room Service",
    ],
    roomTypes: [
      {
        name: "Deluxe Room",
        description: "Modern room with city views, air conditioning, flat-screen TV, and en-suite bathroom.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Superior Room with Lake View",
        description: "Premium room with panoramic views of Kandy Lake, king-size bed, and private balcony.",
        image: hotelImages.rooms.superior,
      },
      {
        name: "Family Room",
        description: "Comfortable family room with twin and double bed setup, city views, kid-friendly amenities, and extra living space for the whole family.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Temple of the Tooth Relic", distance: "2 km", duration: "5 min" },
      { place: "Kandy Lake", distance: "1.5 km", duration: "5 min" },
      { place: "Peradeniya Botanical Garden", distance: "7 km", duration: "15 min" },
      { place: "Kandy City Centre", distance: "1 km", duration: "3 min" },
      { place: "Bandaranaike International Airport", distance: "115 km", duration: "3 hr" },
    ],
    mapCoordinates: { lat: 7.2906, lng: 80.6337 },
  },
  {
    name: "Mandara Resort",
    location: "Mirissa",
    category: "Beach Resort",
    starRating: 4,
    description:
      "Mandara Resort is a stunning beachfront property nestled along the golden sands of Mirissa, one of Sri Lanka's most beautiful coastal destinations. The resort blends tropical luxury with laid-back beach vibes, offering guests an unforgettable seaside experience.\n\nFeaturing spacious rooms and suites with ocean views, an infinity pool overlooking the Indian Ocean, and a beachside restaurant serving fresh seafood and international cuisine, Mandara Resort is the perfect place to unwind after exploring Sri Lanka's cultural highlights. The resort also organizes whale watching excursions, surfing lessons, and snorkeling trips.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Beachfront Location",
      "Infinity Swimming Pool",
      "Beachside Restaurant & Bar",
      "Spa & Wellness Center",
      "Free Wi-Fi",
      "Water Sports Facilities",
      "Whale Watching Tours",
      "Surfing Equipment",
      "Airport Transfer Service",
      "Sun Loungers & Beach Umbrellas",
    ],
    roomTypes: [
      {
        name: "Deluxe Sea View Room",
        description: "Elegant room with panoramic ocean views, king-size bed, air conditioning, and private balcony.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Beach Suite",
        description: "Luxurious suite with direct beach access, living area, outdoor shower, and private terrace.",
        image: hotelImages.rooms.suite,
      },
      {
        name: "Family Room",
        description: "Beachfront family room with twin and double beds, ocean views, a small sitting area, and easy access to the pool and beach activities.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Mirissa Beach", distance: "0 km", duration: "1 min walk" },
      { place: "Whale Watching Point", distance: "2 km", duration: "5 min" },
      { place: "Galle Fort", distance: "35 km", duration: "45 min" },
      { place: "Weligama", distance: "5 km", duration: "10 min" },
      { place: "Bandaranaike International Airport", distance: "190 km", duration: "3.5 hr" },
    ],
    mapCoordinates: { lat: 5.9485, lng: 80.4718 },
  },
  {
    name: "Lynden Grove Hotel",
    location: "Nuwara Eliya",
    category: "Hill Country Hotel",
    starRating: 3,
    description:
      "Lynden Grove Hotel is a charming hill country retreat located in the cool climate of Nuwara Eliya, often referred to as \"Little England\" for its colonial-era architecture and temperate climate. The hotel is surrounded by lush tea plantations and misty mountains, offering a peaceful escape from the tropical heat.\n\nThe hotel features cozy rooms with colonial-style furnishings, a restaurant serving both local and international cuisine, and beautiful gardens where guests can enjoy the fresh mountain air. Its location makes it an ideal base for visiting tea factories, hiking, and exploring the unique charm of Sri Lanka's hill country.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Mountain & Tea Plantation Views",
      "Restaurant with Hill Country Cuisine",
      "Garden & Lounge Area",
      "Free Wi-Fi",
      "Hot Water & Heating",
      "Tour Desk",
      "Free Parking",
      "Fireplace Lounge",
      "Room Service",
    ],
    roomTypes: [
      {
        name: "Standard Double Room",
        description: "Cozy room with mountain views, warm bedding, hot water, and classic colonial furnishings.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Deluxe Room with Garden View",
        description: "Spacious room overlooking the hotel gardens with premium amenities and a private seating area.",
        image: hotelImages.rooms.superior,
      },
      {
        name: "Family Room",
        description: "Cozy family room with warm furnishings, mountain views, two beds, extra blankets for the cool hill country climate, and a spacious bathroom.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Nuwara Eliya Town Center", distance: "2 km", duration: "5 min" },
      { place: "Gregory Lake", distance: "3 km", duration: "8 min" },
      { place: "Pedro Tea Factory", distance: "5 km", duration: "10 min" },
      { place: "Horton Plains National Park", distance: "30 km", duration: "1 hr" },
      { place: "Nanu Oya Railway Station", distance: "8 km", duration: "15 min" },
    ],
    mapCoordinates: { lat: 6.9497, lng: 80.7891 },
  },
  {
    name: "O2 Ella",
    location: "Ella",
    category: "Mountain Hotel",
    starRating: 3,
    description:
      "O2 Ella is a modern boutique hotel perched on the hillside of Ella, offering breathtaking views of the surrounding mountains, valleys, and tea plantations. The hotel provides a perfect blend of comfort and adventure, with stylish rooms that feature floor-to-ceiling windows to maximize the stunning views.\n\nLocated just minutes from Ella's main attractions including the Nine Arch Bridge, Mini Adams Peak, and Ravana Falls, O2 Ella serves as an ideal base for exploring this picturesque hill country town. The hotel's restaurant offers delicious local and international dishes with a panoramic backdrop.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Panoramic Mountain Views",
      "Restaurant & Caf\u00e9",
      "Free Wi-Fi",
      "Air Conditioning",
      "Tour Desk",
      "Hiking Trail Access",
      "Room Service",
      "Free Parking",
      "Terrace with Mountain Views",
    ],
    roomTypes: [
      {
        name: "Deluxe Mountain View Room",
        description: "Modern room with floor-to-ceiling windows offering panoramic mountain views and a comfortable king-size bed.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Superior Room",
        description: "Well-appointed room with valley views, private balcony, and all modern amenities.",
        image: hotelImages.rooms.superior,
      },
      {
        name: "Family Room",
        description: "Family room with panoramic mountain views, twin and double bed arrangement, a private balcony, and plenty of space for families to relax.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Nine Arch Bridge", distance: "3 km", duration: "10 min" },
      { place: "Mini Adams Peak", distance: "2 km", duration: "5 min" },
      { place: "Ravana Falls", distance: "6 km", duration: "12 min" },
      { place: "Ella Town Center", distance: "1 km", duration: "3 min" },
      { place: "Ella Railway Station", distance: "1 km", duration: "3 min" },
    ],
    mapCoordinates: { lat: 6.8667, lng: 81.0466 },
  },
  {
    name: "Ruvisha Beach Hotel",
    location: "Negombo",
    category: "Beach Hotel",
    starRating: 3,
    description:
      "Ruvisha Beach Hotel is a welcoming beachfront property located in Negombo, just a short drive from Bandaranaike International Airport. The hotel offers a comfortable and convenient stay for travelers arriving in or departing from Sri Lanka.\n\nWith direct access to Negombo Beach, a relaxing pool area, and a restaurant serving fresh seafood, Ruvisha Beach Hotel provides the perfect start or end to your Sri Lankan adventure. The hotel's proximity to the airport and Negombo's charming fishing village makes it an ideal base for exploring the local area.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Beachfront Location",
      "Swimming Pool",
      "Restaurant & Bar",
      "Free Wi-Fi",
      "Airport Transfer Service",
      "Free Parking",
      "Tour Desk",
      "Sun Loungers",
      "Room Service",
    ],
    roomTypes: [
      {
        name: "Standard Sea View Room",
        description: "Comfortable room with ocean views, air conditioning, and en-suite bathroom.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Deluxe Room",
        description: "Spacious room with premium furnishings, sea view balcony, and all modern amenities.",
        image: hotelImages.rooms.superior,
      },
      {
        name: "Family Room",
        description: "Family-friendly room with sea views, twin and double beds, air conditioning, and convenient access to the beach and pool.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Negombo Beach", distance: "0 km", duration: "1 min walk" },
      { place: "Negombo Fish Market", distance: "3 km", duration: "8 min" },
      { place: "Negombo Lagoon", distance: "2 km", duration: "5 min" },
      { place: "Bandaranaike International Airport", distance: "12 km", duration: "20 min" },
      { place: "Colombo City", distance: "35 km", duration: "45 min" },
    ],
    mapCoordinates: { lat: 7.2094, lng: 79.8358 },
  },
  {
    name: "Kithala Resort",
    location: "Yala",
    category: "Safari Lodge",
    starRating: 4,
    description:
      "Kithala Resort is a nature-inspired luxury lodge situated on the outskirts of Yala National Park, one of Sri Lanka's premier wildlife destinations. The resort offers an immersive safari experience while providing all the comforts of a modern hotel.\n\nSurrounded by wilderness, guests may spot wildlife right from their room balcony. The resort features spacious rooms with rustic-luxury d\u00e9cor, an outdoor pool, and a restaurant serving both local and international cuisine. Safari jeeps depart directly from the resort, making it the perfect base for early morning and evening game drives.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Adjacent to Yala National Park",
      "Outdoor Swimming Pool",
      "Restaurant & Bar",
      "Safari Jeep Arrangements",
      "Free Wi-Fi",
      "Garden & Nature Trails",
      "Bird Watching Area",
      "Free Parking",
      "Air Conditioning",
      "Room Service",
    ],
    roomTypes: [
      {
        name: "Safari Chalet",
        description: "Rustic-luxury chalet with nature views, king-size bed, private veranda, and outdoor seating area.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Deluxe Room",
        description: "Comfortable room with modern amenities, air conditioning, and views of the surrounding wilderness.",
        image: hotelImages.rooms.superior,
      },
      {
        name: "Family Room",
        description: "Safari-themed family room with nature views, two beds, a private veranda — ideal for families on wildlife adventures in Yala.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Yala National Park Entrance", distance: "5 km", duration: "10 min" },
      { place: "Kataragama Temple", distance: "15 km", duration: "20 min" },
      { place: "Tissamaharama", distance: "12 km", duration: "18 min" },
      { place: "Ravana Falls", distance: "75 km", duration: "1.5 hr" },
      { place: "Bandaranaike International Airport", distance: "280 km", duration: "5 hr" },
    ],
    mapCoordinates: { lat: 6.3695, lng: 81.3877 },
  },
  {
    name: "Randiya Sea View",
    location: "Dickwella",
    category: "Beach Hotel",
    starRating: 3,
    description:
      "Randiya Sea View is a charming coastal hotel located in Dickwella on Sri Lanka's southern coast. The hotel offers stunning views of the Indian Ocean and is surrounded by beautiful tropical gardens. It provides a peaceful and relaxed atmosphere perfect for unwinding after exploring the island.\n\nWith its beachfront location, comfortable rooms, and friendly service, Randiya Sea View offers guests an authentic south coast experience. The hotel's restaurant serves delicious local seafood and the terrace is the perfect spot to watch spectacular sunsets over the ocean.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Ocean View Rooms",
      "Beachfront Access",
      "Restaurant with Sea View",
      "Free Wi-Fi",
      "Garden & Terrace",
      "Free Parking",
      "Tour Desk",
      "Room Service",
      "Bicycle Rental",
    ],
    roomTypes: [
      {
        name: "Sea View Room",
        description: "Comfortable room with panoramic ocean views, air conditioning, and private balcony.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Standard Room",
        description: "Clean and comfortable room with garden views and modern amenities.",
        image: hotelImages.rooms.superior,
      },
      {
        name: "Family Room",
        description: "Comfortable family room with ocean views, twin and double beds, a private balcony, and a cozy seating area for the family.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Dickwella Beach", distance: "0.5 km", duration: "2 min" },
      { place: "Hiriketiya Beach", distance: "5 km", duration: "10 min" },
      { place: "Mirissa", distance: "15 km", duration: "20 min" },
      { place: "Galle Fort", distance: "50 km", duration: "1 hr" },
      { place: "Bandaranaike International Airport", distance: "200 km", duration: "4 hr" },
    ],
    mapCoordinates: { lat: 5.9667, lng: 80.6833 },
  },
  {
    name: "Radisson Blu Hotel",
    location: "Galle",
    category: "Luxury Hotel",
    starRating: 5,
    description:
      "Radisson Blu Hotel Galle is a premium five-star hotel located near the UNESCO World Heritage Galle Fort. The hotel offers luxurious accommodations with elegant rooms and suites, multiple dining options, a stunning infinity pool, and a full-service spa.\n\nSituated just minutes from the historic Galle Fort, the hotel provides the perfect combination of modern luxury and historical charm. Guests can explore the fort's cobblestone streets, visit boutique shops and art galleries, or simply relax at the hotel's world-class facilities. The rooftop bar offers spectacular views of the Indian Ocean and Galle's skyline.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "5-Star Luxury",
      "Infinity Pool with Ocean View",
      "Multiple Restaurants & Bars",
      "Full-Service Spa",
      "Fitness Center",
      "Free Wi-Fi",
      "Concierge Service",
      "Business Center",
      "Room Service 24/7",
      "Airport Transfer Service",
      "Valet Parking",
    ],
    roomTypes: [
      {
        name: "Superior Room",
        description: "Elegant room with modern d\u00e9cor, premium bedding, rain shower, and city or garden views.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Deluxe Sea View Room",
        description: "Luxurious room with panoramic Indian Ocean views, king-size bed, and marble bathroom.",
        image: hotelImages.rooms.superior,
      },
      {
        name: "Ocean Suite",
        description: "Spacious suite with separate living area, private balcony overlooking the ocean, and premium amenities.",
        image: hotelImages.rooms.suite,
      },
      {
        name: "Family Room",
        description: "Elegantly appointed family room with premium twin and double beds, marble bathroom, ocean or garden views, and complimentary kids' amenities.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Galle Fort", distance: "2 km", duration: "5 min" },
      { place: "Unawatuna Beach", distance: "5 km", duration: "10 min" },
      { place: "Jungle Beach", distance: "8 km", duration: "15 min" },
      { place: "Mirissa", distance: "30 km", duration: "40 min" },
      { place: "Bandaranaike International Airport", distance: "155 km", duration: "2.5 hr" },
    ],
    mapCoordinates: { lat: 6.0328, lng: 80.2168 },
  },
  {
    name: "Insight Resort",
    location: "Ahangama",
    category: "Boutique Resort",
    starRating: 4,
    description:
      "Insight Resort is a beautiful boutique property located in Ahangama, on Sri Lanka's scenic southern coast near Galle. The resort offers a perfect blend of traditional Sri Lankan architecture and modern comfort, surrounded by tropical gardens and coconut palms.\n\nWith its serene atmosphere, stunning pool area, and proximity to both pristine beaches and the historic Galle Fort, Insight Resort provides an ideal retreat for travelers seeking relaxation and cultural exploration. The resort's restaurant serves delicious fusion cuisine using fresh, locally sourced ingredients.",
    heroImage: hotelImages.hero,
    galleryImages: hotelImages.gallery,
    features: [
      "Swimming Pool",
      "Restaurant & Bar",
      "Tropical Gardens",
      "Free Wi-Fi",
      "Spa Treatments",
      "Beach Access",
      "Tour Desk",
      "Free Parking",
      "Air Conditioning",
      "Bicycle Rental",
    ],
    roomTypes: [
      {
        name: "Garden View Room",
        description: "Charming room with tropical garden views, air conditioning, and en-suite bathroom.",
        image: hotelImages.rooms.deluxe,
      },
      {
        name: "Pool View Suite",
        description: "Spacious suite overlooking the pool with separate living area and premium amenities.",
        image: hotelImages.rooms.suite,
      },
      {
        name: "Family Room",
        description: "Tropical family room with garden views, twin and double beds, air conditioning, and direct access to the pool and garden area.",
        image: hotelImages.rooms.family,
      },
    ],
    distances: [
      { place: "Ahangama Beach", distance: "1 km", duration: "3 min" },
      { place: "Galle Fort", distance: "20 km", duration: "30 min" },
      { place: "Mirissa Beach", distance: "18 km", duration: "25 min" },
      { place: "Koggala Lake", distance: "8 km", duration: "12 min" },
      { place: "Bandaranaike International Airport", distance: "175 km", duration: "3 hr" },
    ],
    mapCoordinates: { lat: 5.9717, lng: 80.3733 },
  },
];

async function seedHotels() {
  console.log("Seeding hotels...\n");

  const now = new Date().toISOString();
  const batch = db.batch();
  const hotelIds = {};

  for (const hotel of hotels) {
    const docRef = db.collection("hotels").doc();
    batch.set(docRef, {
      ...hotel,
      createdAt: now,
      updatedAt: now,
    });
    hotelIds[hotel.name] = docRef.id;
    console.log(`  Prepared: ${hotel.name} (${hotel.location}) → ${docRef.id}`);
  }

  await batch.commit();
  console.log(`\nSuccessfully seeded ${hotels.length} hotels into Firestore!`);

  // Now update tour itinerary days with hotelIds
  console.log("\nUpdating tour itinerary days with hotel IDs...\n");

  const toursSnapshot = await db.collection("tours").get();
  const updateBatch = db.batch();
  let updatedCount = 0;

  for (const doc of toursSnapshot.docs) {
    const tour = doc.data();
    if (!tour.itinerary || !Array.isArray(tour.itinerary)) continue;

    let changed = false;
    const updatedItinerary = tour.itinerary.map((day) => {
      if (day.accommodation && hotelIds[day.accommodation]) {
        changed = true;
        return { ...day, hotelId: hotelIds[day.accommodation] };
      }
      return day;
    });

    if (changed) {
      updateBatch.update(doc.ref, { itinerary: updatedItinerary, updatedAt: now });
      updatedCount++;
      console.log(`  Updated: ${tour.name} (${updatedItinerary.filter((d) => d.hotelId).length} days linked)`);
    }
  }

  if (updatedCount > 0) {
    await updateBatch.commit();
    console.log(`\nUpdated ${updatedCount} tours with hotel references!`);
  } else {
    console.log("\nNo tours needed hotel reference updates.");
  }

  console.log("\nDone!");
  process.exit(0);
}

seedHotels().catch((err) => {
  console.error("Error seeding hotels:", err);
  process.exit(1);
});
