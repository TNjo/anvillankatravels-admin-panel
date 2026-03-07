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

const PARENT_TOUR_NAME = "Luxury Holidays Classic Sri Lanka";

const subPackages = [
  // ========================================
  // 4 Nights / 5 Days Tour
  // ========================================
  {
    name: "Classic & Cultural - 5 Days",
    parentTourName: PARENT_TOUR_NAME,
    duration: { days: 5, nights: 4 },
    summary:
      "A perfect short getaway covering the cultural highlights of Sri Lanka. Explore Sigiriya, experience village life, visit the sacred Temple of the Tooth in Kandy, relax on southern beaches, and discover the historic Galle Fort.",
    route: ["Sigiriya", "Kandy", "South Coast", "Galle"],
    tags: ["culture", "wildlife", "nature", "beach", "heritage"],
    heroImage: "/images/tours/classic-5d/sigiriya.jpg",
    highlights: [
      "Sunset hike at Sigiriya Rock Fortress",
      "Traditional cultural village tour with bullock cart ride",
      "Jeep safari at Minneriya or Kaudulla National Park",
      "Visit the sacred Temple of the Tooth Relic in Kandy",
      "Explore Dambulla Cave Temple",
      "Full day beach relaxation on the south coast",
      "Discover UNESCO World Heritage Galle Fort",
      "Optional Madu River boat safari",
    ],
    placesToStay: [
      { location: "Sigiriya", hotel: "Sigiri Asna Nature Resort", type: "Nature Resort" },
      { location: "Kandy", hotel: "Skyloft Hotel", type: "City Hotel" },
      { location: "South Coast", hotel: "Mandara Resort", type: "Beach Resort" },
    ],
    itinerary: [
      {
        day: 1,
        title: "Welcome to Sri Lanka / Sigiriya",
        description:
          "Welcome to Sri Lanka! Upon arrival at the airport, you will be greeted and transferred to Dambulla. Optionally visit the Pinnawala Elephant Orphanage en route. In the evening, enjoy a breathtaking Sigiriya hike to capture the stunning sunset views over the ancient rock fortress.",
        image: "/images/tours/classic-5d/sigiriya-sunset.jpg",
        location: "Sigiriya",
        activities: [
          "Airport welcome",
          "Transfer to Dambulla",
          "Pinnawala Elephant Orphanage (optional)",
          "Evening Sigiriya sunset hike",
        ],
        accommodation: "Sigiri Asna Nature Resort",
      },
      {
        day: 2,
        title: "Cultural Village Tour / Safari",
        description:
          "Start your day with an immersive cultural village tour including a traditional bullock cart ride, a catamaran ride with views of Sigiriya, a cooking demonstration, and a traditional Sri Lankan lunch. In the afternoon, head out for an exciting jeep safari at Minneriya, Kaudulla, or Habarana National Park to spot elephants and other wildlife. Relax at your cozy hotel in the evening.",
        image: "/images/tours/classic-5d/cultural-village.jpg",
        location: "Sigiriya",
        activities: [
          "Cultural village tour",
          "Bullock cart ride",
          "Catamaran ride with Sigiriya view",
          "Cooking demonstration",
          "National park jeep safari",
        ],
        accommodation: "Sigiri Asna Nature Resort",
      },
      {
        day: 3,
        title: "Kandy - Cultural Capital",
        description:
          "Morning transfer to Kandy, the cultural capital of Sri Lanka. En route, visit the magnificent Dambulla Cave Temple, a UNESCO World Heritage Site with stunning Buddhist murals. Stop at a spice garden in Matale or visit a gem museum. In Kandy, explore the sacred Temple of the Tooth Relic and stroll around Kandy Lake. End the day with a night walk through Kandy city and enjoy dinner at a local restaurant.",
        image: "/images/tours/classic-5d/kandy.jpg",
        location: "Kandy",
        activities: [
          "Dambulla Cave Temple visit",
          "Spice garden / Gem Museum",
          "Temple of the Tooth Relic",
          "Kandy Lake walk",
          "Kandy city night walk & dinner",
        ],
        accommodation: "Skyloft Hotel",
      },
      {
        day: 4,
        title: "Beach Relaxing Day",
        description:
          "Transfer to the beautiful south coast of Sri Lanka for a full day of beach relaxation. Enjoy the golden sands, crystal clear waters, and laid-back atmosphere of the southern beaches. Take in the tropical scenery and unwind at your beachside resort.",
        image: "/images/tours/classic-5d/beach.jpg",
        location: "South Coast",
        activities: ["Transfer to south coast", "Full day beach relaxation", "Swimming & sunbathing"],
        accommodation: "Mandara Resort",
      },
      {
        day: 5,
        title: "Departure",
        description:
          "Visit the iconic Galle Fort, a UNESCO World Heritage Site, and explore its charming streets lined with colonial architecture, boutique shops, and cafes. Optionally enjoy a Madu River boat safari to see the rich mangrove ecosystem. Afterwards, transfer to the airport for your departure flight.",
        image: "/images/tours/classic-5d/galle-fort.jpg",
        location: "Galle",
        activities: ["Galle Fort visit", "Madu River boat safari (optional)", "Airport transfer"],
      },
    ],
    published: true,
  },

  // ========================================
  // 6 Nights / 7 Days Tour
  // ========================================
  {
    name: "Classic & Cultural - 7 Days",
    parentTourName: PARENT_TOUR_NAME,
    duration: { days: 7, nights: 6 },
    summary:
      "The ideal week-long Sri Lankan adventure covering cultural highlights, scenic hill country, the famous train ride, wildlife safaris, and coastal charm. From Sigiriya to Colombo, experience the very best of the island.",
    route: ["Sigiriya", "Kandy", "Nuwara Eliya", "Ella", "Yala", "Galle", "Colombo"],
    tags: ["culture", "wildlife", "nature", "beach", "heritage", "adventure"],
    heroImage: "/images/tours/classic-7d/train.jpg",
    highlights: [
      "Sunset hike at Sigiriya Rock Fortress",
      "Visit the sacred Temple of the Tooth Relic in Kandy",
      "Explore the Royal Botanical Gardens at Peradeniya",
      "Scenic train ride from Nanu Oya to Ella",
      "Hike to Nine Arch Bridge and Mini Adams Peak",
      "Jeep safari at Yala National Park",
      "Whale watching boat tour",
      "Discover UNESCO World Heritage Galle Fort",
      "Colombo city tour",
    ],
    placesToStay: [
      { location: "Sigiriya", hotel: "Sigiri Asna Nature Resort", type: "Nature Resort" },
      { location: "Kandy", hotel: "Skyloft Hotel", type: "City Hotel" },
      { location: "Nuwara Eliya", hotel: "Lynden Grove Hotel", type: "Hill Country Hotel" },
      { location: "Ella", hotel: "O2 Ella", type: "Mountain Hotel" },
      { location: "Mirissa", hotel: "Mandara Resort", type: "Beach Resort" },
      { location: "Galle", hotel: "Radisson Blue Hotel", type: "Luxury Hotel" },
    ],
    itinerary: [
      {
        day: 1,
        title: "Welcome to Sri Lanka / Sigiriya",
        description:
          "Welcome to Sri Lanka! Upon arrival at the airport, you will be greeted and transferred to Dambulla. Optionally visit the Pinnawala Elephant Orphanage en route. In the evening, enjoy a breathtaking Sigiriya hike to capture the stunning sunset views over the ancient rock fortress.",
        image: "/images/tours/classic-7d/sigiriya.jpg",
        location: "Sigiriya",
        activities: [
          "Airport welcome",
          "Transfer to Dambulla",
          "Pinnawala Elephant Orphanage (optional)",
          "Evening Sigiriya sunset hike",
        ],
        accommodation: "Sigiri Asna Nature Resort",
      },
      {
        day: 2,
        title: "Kandy - Cultural Capital",
        description:
          "Morning transfer to Kandy. En route, visit the magnificent Dambulla Cave Temple, a UNESCO World Heritage Site. Stop at a spice garden in Matale or visit a gem museum. In Kandy, explore the sacred Temple of the Tooth Relic and walk around Kandy Lake. Enjoy an evening of traditional Kandyan cultural dance performance followed by dinner and a night walk through the city.",
        image: "/images/tours/classic-7d/kandy.jpg",
        location: "Kandy",
        activities: [
          "Dambulla Cave Temple visit",
          "Spice garden / Gem Museum",
          "Temple of the Tooth Relic",
          "Kandy Lake",
          "Cultural dance show",
          "Night walk & dinner",
        ],
        accommodation: "Skyloft Hotel",
      },
      {
        day: 3,
        title: "Explore Sri Lanka Countryside",
        description:
          'Begin your morning with a visit to the stunning Peradeniya Royal Botanical Garden, home to a remarkable collection of tropical flora. Then transfer to Nuwara Eliya, the "Little England" of Sri Lanka. En route, visit a tea factory to learn about Ceylon tea production. In the evening, take a leisurely walk through the charming Nuwara Eliya city center, visiting the local market, the old post office, and the golf club.',
        image: "/images/tours/classic-7d/tea-country.jpg",
        location: "Nuwara Eliya",
        activities: [
          "Peradeniya Botanical Garden",
          "Transfer to Nuwara Eliya",
          "Tea factory visit",
          "Nuwara Eliya city walk",
        ],
        accommodation: "Lynden Grove Hotel",
      },
      {
        day: 4,
        title: "One of the World's Best Train Rides",
        description:
          "Experience one of the most scenic train journeys in the world from Nanu Oya to Ella. Watch the breathtaking landscape of tea plantations, mountains, and valleys unfold before you. Upon arrival in Ella, visit the iconic Nine Arch Bridge and hike up Mini Adams Peak for panoramic views. Spend the evening exploring the vibrant Ella village with its cozy cafes and stunning mountain backdrop.",
        image: "/images/tours/classic-7d/train-ride.jpg",
        location: "Ella",
        activities: [
          "Scenic train ride (Nanu Oya to Ella)",
          "Nine Arch Bridge visit",
          "Mini Adams Peak hike",
          "Ella village exploration",
        ],
        accommodation: "O2 Ella",
      },
      {
        day: 5,
        title: "Yala National Park / Beach Relaxing",
        description:
          "Transfer to Yala, stopping en route at the magnificent Ravana Waterfall. Embark on an exciting jeep safari through Yala National Park, Sri Lanka's most visited wildlife sanctuary, home to leopards, elephants, crocodiles, and a rich variety of birdlife. In the evening, transfer to Mirissa and relax at your beachside hotel.",
        image: "/images/tours/classic-7d/yala-safari.jpg",
        location: "Yala / Mirissa",
        activities: [
          "Ravana Waterfall visit",
          "Yala National Park jeep safari",
          "Transfer to Mirissa",
          "Beach relaxation",
        ],
        accommodation: "Mandara Resort",
      },
      {
        day: 6,
        title: "Explore UNESCO World Heritage Site",
        description:
          "Start with an early morning whale watching boat tour off the coast of Mirissa, one of the best places in the world to spot blue whales. Transfer to Galle, stopping en route at a Turtle Hatchery Center to learn about sea turtle conservation. Enjoy a Madu River boat safari through the mangrove ecosystem. In the evening, explore the historic Galle Fort, a UNESCO World Heritage Site with charming colonial streets.",
        image: "/images/tours/classic-7d/galle-fort.jpg",
        location: "Galle",
        activities: [
          "Whale watching boat tour",
          "Turtle Hatchery Center",
          "Madu River boat safari",
          "Galle Fort visit",
          "Bicycling (optional)",
        ],
        accommodation: "Radisson Blue Hotel",
      },
      {
        day: 7,
        title: "Colombo City Tour / Departure",
        description:
          "Transfer to Colombo for a city tour exploring the vibrant capital. Visit the iconic Red Mosque, the serene Gangarama Temple, the historic Independence Square, and the famous Galle Face promenade. Stop at One Galle Face shopping mall for any last-minute shopping before being transferred to the airport for your departure.",
        image: "/images/tours/classic-7d/colombo.jpg",
        location: "Colombo",
        activities: [
          "Transfer to Colombo",
          "Red Mosque",
          "Gangarama Temple",
          "Independence Square",
          "Galle Face",
          "One Galle Face Shopping Mall",
          "Airport transfer",
        ],
      },
    ],
    published: true,
  },

  // ========================================
  // 9 Nights / 10 Days Tour
  // ========================================
  {
    name: "Classic & Cultural - 10 Days",
    parentTourName: PARENT_TOUR_NAME,
    duration: { days: 10, nights: 9 },
    summary:
      "The ultimate Sri Lankan experience. This comprehensive tour covers everything from cultural villages and ancient temples to hill country train rides, wildlife safaris, whale watching, and pristine beaches. A perfectly paced journey with time to truly immerse in each destination.",
    route: [
      "Negombo",
      "Sigiriya",
      "Kandy",
      "Nuwara Eliya",
      "Ella",
      "Yala",
      "South Coast",
      "Galle",
      "Colombo",
    ],
    tags: ["culture", "wildlife", "nature", "beach", "heritage", "adventure", "relaxation"],
    heroImage: "/images/tours/classic-10d/elephants.jpg",
    highlights: [
      "Explore Negombo and its charming lagoon",
      "Cultural village tour with traditional lunch",
      "Sunset hike at Sigiriya Rock Fortress",
      "Ancient Ritigala Forest Monastery",
      "Jeep safari at Minneriya / Kaudulla National Park",
      "Visit the sacred Temple of the Tooth Relic in Kandy",
      "Scenic train ride from Nanu Oya to Ella",
      "Yala National Park jeep safari",
      "Whale watching boat tour",
      "Discover UNESCO World Heritage Galle Fort",
      "Colombo city tour",
    ],
    placesToStay: [
      { location: "Negombo", hotel: "Ruvisha Beach Hotel", type: "Beach Hotel" },
      { location: "Sigiriya", hotel: "Sigiri Asna Nature Resort", type: "Nature Resort" },
      { location: "Kandy", hotel: "Skyloft Hotel", type: "City Hotel" },
      { location: "Nuwara Eliya", hotel: "Lynden Grove Hotel", type: "Hill Country Hotel" },
      { location: "Ella", hotel: "O2 Ella", type: "Mountain Hotel" },
      { location: "Yala", hotel: "Kithala Resort", type: "Safari Lodge" },
      { location: "South Coast", hotel: "Randiya Sea View", type: "Beach Hotel" },
      { location: "Galle", hotel: "Insight Resort", type: "Boutique Resort" },
    ],
    itinerary: [
      {
        day: 1,
        title: "Welcome to Sri Lanka / Negombo",
        description:
          "Welcome to Sri Lanka! Upon arrival at the airport, you will be greeted and transferred to Negombo, a charming coastal city near the airport. Optionally enjoy a lagoon tour or a night city walk. Spend the evening relaxing at the beach or your cozy hotel.",
        image: "/images/tours/classic-10d/negombo.jpg",
        location: "Negombo",
        activities: [
          "Airport welcome",
          "Transfer to Negombo",
          "Lagoon tour (optional)",
          "Night city walk (optional)",
          "Beach relaxation",
        ],
        accommodation: "Ruvisha Beach Hotel",
      },
      {
        day: 2,
        title: "Cultural Village Tour / Sigiriya",
        description:
          "Transfer to Sigiriya and immerse yourself in rural Sri Lankan life with a cultural village tour featuring a traditional lunch cooked using age-old methods. In the evening, hike up the iconic Sigiriya Rock Fortress to witness a breathtaking sunset from atop this ancient citadel.",
        image: "/images/tours/classic-10d/sigiriya.jpg",
        location: "Sigiriya",
        activities: [
          "Transfer to Sigiriya",
          "Cultural village tour with traditional lunch",
          "Evening Sigiriya sunset hike",
        ],
        accommodation: "Sigiri Asna Nature Resort",
      },
      {
        day: 3,
        title: "Jeep Safari",
        description:
          'In the morning, explore the mysterious Ritigala Forest Monastery, an ancient monastic complex hidden in a remote mountain wilderness. In the evening, embark on an exciting jeep safari at Minneriya or Kaudulla National Park, famous for "The Gathering" - one of the largest concentrations of wild Asian elephants in the world.',
        image: "/images/tours/classic-10d/minneriya.jpg",
        location: "Sigiriya",
        activities: [
          "Ritigala Forest Monastery",
          "Minneriya / Kaudulla National Park jeep safari",
          "Ayurvedic treatment at hotel (optional)",
        ],
        accommodation: "Sigiri Asna Nature Resort",
      },
      {
        day: 4,
        title: "Historic Kandy",
        description:
          "Morning transfer to Kandy, the last royal capital of Sri Lanka. En route, visit the Dambulla Royal Cave Temple, a UNESCO World Heritage Site featuring five caves with over 150 Buddha statues. In Kandy, visit the sacred Temple of the Tooth Relic and enjoy panoramic views from the Kandy View Point. End the day with a mesmerizing traditional cultural dance show.",
        image: "/images/tours/classic-10d/kandy.jpg",
        location: "Kandy",
        activities: [
          "Transfer to Kandy",
          "Dambulla Royal Cave Temple",
          "Temple of the Tooth Relic",
          "Kandy View Point",
          "Cultural dance show",
        ],
        accommodation: "Skyloft Hotel",
      },
      {
        day: 5,
        title: "Sri Lanka Hill Country",
        description:
          'Morning transfer to Nuwara Eliya, Sri Lanka\'s "Little England." En route, visit the stunning Peradeniya Royal Botanical Garden. Stop at a tea factory to learn about world-famous Ceylon tea production. In the evening, explore the charming Nuwara Eliya city center with its colonial architecture, visit the local fruit and vegetable market, and enjoy the cool mountain air.',
        image: "/images/tours/classic-10d/nuwara-eliya.jpg",
        location: "Nuwara Eliya",
        activities: [
          "Peradeniya Botanical Garden",
          "Transfer to Nuwara Eliya",
          "Tea factory visit",
          "Nuwara Eliya city center walk",
          "Fruit & vegetable market",
        ],
        accommodation: "Lynden Grove Hotel",
      },
      {
        day: 6,
        title: "Ella Village",
        description:
          "Experience one of the most scenic train journeys in the world from Nanu Oya to Ella. Watch breathtaking landscapes of tea plantations, mountains, and valleys unfold before you. Explore the charming Ella village, visit the iconic Nine Arch Bridge, and hike up Mini Adams Peak for panoramic views. Spend the evening walking through Ella's vibrant main street.",
        image: "/images/tours/classic-10d/train.jpg",
        location: "Ella",
        activities: [
          "Scenic train ride (Nanu Oya to Ella)",
          "Explore Ella Village",
          "Nine Arch Bridge",
          "Mini Adams Peak hike",
          "Ella evening walk",
        ],
        accommodation: "O2 Ella",
      },
      {
        day: 7,
        title: "Yala National Park",
        description:
          "Transfer to Yala, stopping en route at the magnificent Ravana Waterfall, one of the widest waterfalls in Sri Lanka. Embark on an exciting jeep safari through Yala National Park, Sri Lanka's most visited wildlife sanctuary, home to leopards, elephants, sloth bears, and a rich variety of birdlife. In the evening, visit the sacred Kataragama Temple.",
        image: "/images/tours/classic-10d/yala.jpg",
        location: "Yala",
        activities: [
          "Transfer to Yala",
          "Ravana Waterfall visit",
          "Yala National Park jeep safari",
          "Kataragama Temple visit",
        ],
        accommodation: "Kithala Resort",
      },
      {
        day: 8,
        title: "South Coast / Beach Relax",
        description:
          "Morning transfer to the beautiful Mirissa or Dickwella beach area on the south coast. Enjoy a full day of relaxation on pristine golden beaches. Optional water activities include snorkeling, diving, surfing, and other water sports. Soak in the tropical sun and enjoy the laid-back coastal atmosphere.",
        image: "/images/tours/classic-10d/mirissa.jpg",
        location: "South Coast",
        activities: [
          "Transfer to Mirissa / Dickwella",
          "Full day beach relaxation",
          "Water sports (optional)",
          "Snorkeling & diving (optional)",
          "Surfing (optional)",
        ],
        accommodation: "Randiya Sea View",
      },
      {
        day: 9,
        title: "Explore UNESCO World Heritage Site",
        description:
          "Start with an early morning whale watching boat tour, one of the best places in the world to spot blue whales. Transfer to Galle, stopping en route at a Turtle Hatchery Center to learn about sea turtle conservation. Enjoy a Madu River boat safari through the rich mangrove ecosystem. In the evening, explore the historic Galle Fort, a UNESCO World Heritage Site.",
        image: "/images/tours/classic-10d/galle-fort.jpg",
        location: "Galle",
        activities: [
          "Whale watching boat tour",
          "Turtle Hatchery Center",
          "Madu River boat safari",
          "Galle Fort visit",
          "Bicycling (optional)",
        ],
        accommodation: "Insight Resort",
      },
      {
        day: 10,
        title: "Colombo City Tour / Departure",
        description:
          "Transfer to Colombo for a city tour exploring the vibrant capital. Visit the iconic Red Mosque, the serene Gangarama Temple, the historic Independence Square, and the famous Galle Face promenade. Stop at One Galle Face shopping mall for any last-minute shopping before being transferred to the airport for your departure.",
        image: "/images/tours/classic-10d/colombo.jpg",
        location: "Colombo",
        activities: [
          "Transfer to Colombo",
          "Red Mosque",
          "Gangarama Temple",
          "Independence Square",
          "Galle Face",
          "One Galle Face Shopping Mall",
          "Airport transfer",
        ],
      },
    ],
    published: true,
  },
];

async function seedSubPackages() {
  console.log("Seeding Classic & Cultural sub-packages...\n");

  const now = new Date().toISOString();
  const batch = db.batch();

  for (const pkg of subPackages) {
    const docRef = db.collection("tours").doc();
    batch.set(docRef, {
      ...pkg,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  Prepared: ${pkg.name} (${pkg.duration.days} days)`);
  }

  await batch.commit();
  console.log("\nSuccessfully seeded 3 sub-packages into Firestore!");
  process.exit(0);
}

seedSubPackages().catch((err) => {
  console.error("Error seeding sub-packages:", err);
  process.exit(1);
});
