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

function day(n, title, location, description, activities, accommodation) {
  return {
    day: n,
    title,
    description,
    image: "",
    location,
    activities,
    ...(accommodation ? { accommodation } : {}),
  };
}

function stay(location, hotel, type) {
  return { location, hotel, type };
}

const sharedFaqs = [
  {
    question: "What is included in this package?",
    answer:
      "VIP airport greeting, private luxury vehicle with an expert chauffeur-guide, accommodation as listed for your chosen hotel category, all named experiences in the itinerary, and VIP lounge access on departure. International flights, visas, entrance fees where noted as optional, and personal expenses are not included.",
  },
  {
    question: "Can we change the hotel category?",
    answer:
      "Yes. Luxury, Boutique, and Good-Value Premium hotels can be mixed across the journey. Your travel designer will confirm availability and adjust the quote before booking.",
  },
  {
    question: "How much driving is involved?",
    answer:
      "Routes are paced for comfort with scenic stops. Longer transfers use expressways where available. Your chauffeur-guide stays with you throughout, so you can rest between experiences.",
  },
];

// ---------------------------------------------------------------------------
// Parents
// ---------------------------------------------------------------------------

const parents = [
  {
    name: "The Grand Island",
    duration: { days: 0, nights: 0 },
    summary:
      "The ultimate flagship Sri Lanka experience combining ancient culture, wildlife safaris, misty tea country, scenic hill country, luxury beach stays, and vibrant culinary experiences. Choose 7, 10, or 14 days.",
    route: [
      "Negombo",
      "Anuradhapura",
      "Sigiriya",
      "Kandy",
      "Nuwara Eliya",
      "Ella",
      "Yala",
      "Galle Fort",
      "Tangalle",
      "Colombo",
    ],
    tags: ["culture", "wildlife", "luxury", "beach", "heritage", "adventure"],
    heroImage: "",
    highlights: [],
    placesToStay: [],
    itinerary: [],
    faqs: sharedFaqs,
    published: true,
  },
  {
    name: "The Highland Zen",
    duration: { days: 0, nights: 0 },
    summary:
      "Tea plantations, mist-shrouded mountains, wellness, yoga, meditation, waterfalls, and slow travel. A spiritual and physical reset in Sri Lanka's most tranquil highland sanctuaries. Choose 7, 10, or 14 days.",
    route: ["Kandy", "Sigiriya", "Nuwara Eliya", "Ella", "Haputale", "South Coast"],
    tags: ["wellness", "nature", "tea", "relaxation", "adventure"],
    heroImage: "",
    highlights: [],
    placesToStay: [],
    itinerary: [],
    faqs: sharedFaqs,
    published: true,
  },
  {
    name: "Wild Lanka Family Expedition",
    duration: { days: 0, nights: 0 },
    summary:
      "Wildlife, animal encounters, family adventure, education, and comfortable family-oriented beach resorts. Built for families who want a comprehensive Sri Lanka holiday with reasonable driving times. Choose 7, 10, or 14 days.",
    route: [
      "Negombo",
      "Anuradhapura",
      "Sigiriya",
      "Kandy",
      "Nuwara Eliya",
      "Ella",
      "Yala",
      "South Coast",
      "Colombo",
    ],
    tags: ["family", "wildlife", "safari", "beach", "adventure"],
    heroImage: "",
    highlights: [],
    placesToStay: [],
    itinerary: [],
    faqs: sharedFaqs,
    published: true,
  },
  {
    name: "Ceylon Romance & Heritage",
    duration: { days: 0, nights: 0 },
    summary:
      "Romance, culture, colonial history, luxury boutique stays, scenic hill country, tea, and secluded beaches. Designed for honeymooners and couples seeking the pinnacle of Sri Lankan heritage and romance. Choose 7, 10, or 14 days.",
    route: [
      "Negombo",
      "Anuradhapura",
      "Sigiriya",
      "Kandy",
      "Nuwara Eliya",
      "Ella",
      "Yala",
      "Galle Fort",
      "Tangalle",
    ],
    tags: ["romance", "honeymoon", "culture", "heritage", "luxury", "beach"],
    heroImage: "",
    highlights: [],
    placesToStay: [],
    itinerary: [],
    faqs: sharedFaqs,
    published: true,
  },
  {
    name: "The Surf & Soul Odyssey",
    duration: { days: 0, nights: 0 },
    summary:
      "Surfing, coastal lifestyle, wellness, tropical adventure, and local culture. For active travelers, friends, and surf-loving couples looking for a tropical reset. Choose 7, 10, or 14 days.",
    route: [
      "Negombo",
      "Sigiriya",
      "Kandy",
      "Ella",
      "Yala",
      "Tangalle",
      "Hiriketiya",
      "Weligama",
      "Galle Fort",
    ],
    tags: ["surf", "beach", "adventure", "wildlife", "relaxation"],
    heroImage: "",
    highlights: [],
    placesToStay: [],
    itinerary: [],
    faqs: sharedFaqs,
    published: true,
  },
];

// ---------------------------------------------------------------------------
// The Grand Island
// ---------------------------------------------------------------------------

const grandIsland14 = {
  name: "The Grand Island - 14 Days",
  parentTourName: "The Grand Island",
  duration: { days: 14, nights: 13 },
  summary:
    "The definitive two-week luxury journey across every facet of Sri Lanka — ancient capitals, wildlife safaris, misty tea country, the Ella train, Yala leopards, Galle Fort, Tangalle beaches, and a colonial Colombo farewell.",
  route: [
    "Negombo",
    "Anuradhapura",
    "Sigiriya",
    "Kandy",
    "Nuwara Eliya",
    "Ella",
    "Yala",
    "Galle Fort",
    "Tangalle",
    "Colombo",
  ],
  tags: ["culture", "wildlife", "luxury", "beach", "heritage", "adventure"],
  heroImage: "",
  highlights: [
    "The definitive grand route: Anuradhapura, Sigiriya, Kandy, Nuwara Eliya, Ella train, Yala, Galle Fort, Tangalle, and Colombo",
    "Seasonal sunrise hot air balloon over the ancient royal capitals",
    "Private tea estate blending masterclass and colonial high tea",
    "Multiple Yala leopard game drives with expert naturalists",
    "Private Colombo colonial heritage tour and fine-dining farewell feast",
  ],
  placesToStay: [
    stay("Anuradhapura", "Uga Ulagalla", "Boutique Villa"),
    stay("Sigiriya", "Jetwing Vil Uyana", "Boutique Eco-Resort"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Nuwara Eliya", "Ceylon Tea Trails", "Luxury Planter Bungalow"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Resort"),
    stay("Yala", "Wild Coast Tented Lodge", "Luxury Safari Lodge"),
    stay("Yala", "Cinnamon Wild", "Good-Value Premium"),
    stay("Galle Fort", "Amangalla", "Luxury Heritage Hotel"),
    stay("Tangalle", "Amanwella", "Luxury Beach Resort"),
    stay("Tangalle", "The Last House", "Boutique Beach Villa"),
    stay("Tangalle", "Anantara Peace Haven", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Negombo Welcome",
      "Negombo",
      "Touch down at Bandaranaike International Airport to a private VIP greeting. Your chauffeur transfers you to a Negombo boutique resort for a gentle first evening — sunset welcome cocktails and time to settle in after the flight.",
      ["VIP airport greeting", "Private luxury transfer", "Sunset welcome cocktail"],
      "Negombo Boutique Resort"
    ),
    day(
      2,
      "Ancient Capital of Anuradhapura",
      "Anuradhapura",
      "A scenic drive north into Sri Lanka's first kingdom. Walk beneath the sacred Sri Maha Bodhi, then explore sunset-lit stupas and palace ruins with a private guide before retiring to a luxury villa.",
      ["Scenic drive to the ancient capital", "Sacred Bodhi tree walk", "Sunset ruins tour"],
      "Anuradhapura Luxury Villa"
    ),
    day(
      3,
      "Transfer to Sigiriya",
      "Sigiriya",
      "A final morning among Anuradhapura's monasteries, then transfer into the Cultural Triangle. Check into a luxury eco-resort and unwind with an evening spa treatment.",
      ["Morning ruins tour", "Transfer to Sigiriya", "Evening spa treatment"],
      "Sigiriya Luxury Eco-Resort"
    ),
    day(
      4,
      "Balloon, Lion Rock & Minneriya",
      "Sigiriya",
      "Rise for a seasonal sunrise hot air balloon over the royal capitals. Climb Sigiriya Rock Fortress, then head out on a Minneriya jeep safari to witness wild Asian elephants at the tank.",
      ["Sunrise hot air balloon flight (seasonal)", "Sigiriya Rock climb", "Minneriya safari"],
      "Sigiriya Luxury Eco-Resort"
    ),
    day(
      5,
      "Kandy — Temple of the Tooth",
      "Kandy",
      "Journey south through spice gardens to the last royal capital. Stroll Peradeniya Botanical Gardens, then attend the evening ceremony at the Temple of the Tooth.",
      ["Spice gardens", "Peradeniya Botanical Gardens", "Temple of the Tooth evening ceremony"],
      "Kandy Hillside Hotel"
    ),
    day(
      6,
      "Tea Country Masterclass",
      "Nuwara Eliya",
      "Ascend into misty tea country. A historic factory masterclass covers plucking, withering, and tasting, followed by a traditional colonial high tea at your manor.",
      ["Scenic hill ascent", "Historic tea factory masterclass", "Traditional high tea"],
      "Nuwara Eliya Colonial Manor"
    ),
    day(
      7,
      "The Blue Train to Ella",
      "Ella",
      "Board a first-class observation cabin for one of the world's great train journeys — tea estates, waterfalls, and mountain villages unfolding all the way to Ella.",
      ["First-class scenic train through tea estates", "Arrival in Ella"],
      "Ella Mountain Resort"
    ),
    day(
      8,
      "Descent to Yala Safari",
      "Yala",
      "Leave the highlands for Yala National Park. After check-in at a luxury tented camp, set out on an afternoon leopard-tracking jeep safari with a specialist naturalist.",
      ["Mountain descent to Yala", "Afternoon leopard-tracking jeep safari"],
      "Yala Luxury Tented Camp"
    ),
    day(
      9,
      "Yala Game Drives & Bush Breakfast",
      "Yala",
      "A dawn game drive when leopards and elephants are most active, followed by a bush breakfast. Return to camp for a leisurely afternoon among the dunes.",
      ["Morning jeep safari", "Bush breakfast", "Afternoon leisure at glamping camp"],
      "Yala Luxury Tented Camp"
    ),
    day(
      10,
      "Galle Fort Ramparts",
      "Galle Fort",
      "Drive the south coast to UNESCO-listed Galle Fort. A private walking tour covers Dutch ramparts, colonial streets, and a sunset from the walls.",
      ["Drive to the south coast", "Historic Galle Fort walking tour", "Rampart sunset"],
      "Galle Fort Boutique Hotel"
    ),
    day(
      11,
      "Secluded Tangalle & Ayurveda",
      "Tangalle",
      "Transfer to a secluded Tangalle beach resort. Spend the day in a couple's Ayurveda spa — herbal oils, steam, and ocean air.",
      ["Transfer to secluded beach resort", "Couple's Ayurveda spa day"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      12,
      "Beach Leisure & Catamaran Sunset",
      "Tangalle",
      "A full day at leisure on Tangalle's quiet sands. In the evening, sail a private sunset catamaran along the southern coast.",
      ["Day at leisure", "Coastal relaxation", "Sunset catamaran cruise"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      13,
      "Colombo Colonial Heritage",
      "Colombo",
      "Take the expressway to the capital for a private colonial architecture walk and high-end shopping, then a fine-dining farewell feast.",
      ["Expressway drive to the capital", "Colonial heritage architecture tour", "High-end shopping"],
      "Colombo Luxury City Hotel"
    ),
    day(
      14,
      "Departure",
      "Colombo",
      "A leisurely breakfast, then a private transfer to Bandaranaike International Airport with VIP lounge access for your departure.",
      ["Leisurely breakfast", "Private airport transfer", "VIP lounge access"]
    ),
  ],
  faqs: [
    ...sharedFaqs,
    {
      question: "Is the hot air balloon flight guaranteed?",
      answer:
        "The sunrise balloon is seasonal and weather-dependent, typically November to April. If it cannot operate, we arrange an alternative sunrise experience over the Cultural Triangle.",
    },
  ],
  published: true,
};

const grandIsland10 = {
  name: "The Grand Island - 10 Days",
  parentTourName: "The Grand Island",
  duration: { days: 10, nights: 9 },
  summary:
    "A comprehensive, balanced luxury journey for first-time visitors — Cultural Triangle, Kandy, the Ella train, Yala leopard safari, Galle Fort, and Tangalle beach.",
  route: ["Negombo", "Sigiriya", "Kandy", "Ella", "Yala", "Tangalle"],
  tags: ["culture", "wildlife", "luxury", "beach", "heritage"],
  heroImage: "",
  highlights: [
    "Comprehensive flagship route: Cultural Triangle, Kandy, Nuwara Eliya, Ella train, Yala, Galle Fort, and Tangalle",
    "Seasonal sunrise balloon over Sigiriya",
    "First-class observation cabin on the Blue Train through tea country",
    "Luxury tented camp with a bush barbecue under the stars",
  ],
  placesToStay: [
    stay("Sigiriya", "Jetwing Vil Uyana", "Boutique Villa"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Resort"),
    stay("Nuwara Eliya", "Goatfell", "Boutique Tea Bungalow"),
    stay("Yala", "Wild Coast Tented Lodge", "Luxury Safari Lodge"),
    stay("Yala", "Cinnamon Wild", "Good-Value Premium"),
    stay("Tangalle", "Amanwella", "Luxury Beach Resort"),
    stay("Tangalle", "The Last House", "Boutique Beach Villa"),
    stay("Tangalle", "Anantara Peace Haven", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Negombo Welcome",
      "Negombo",
      "VIP airport greeting and a short private transfer to a Negombo boutique resort. Sunset welcome cocktails ease you into the island.",
      ["VIP airport greeting", "Private transfer", "Sunset welcome cocktail"],
      "Negombo Boutique Resort"
    ),
    day(
      2,
      "Cultural Triangle & Village Boat",
      "Sigiriya",
      "Scenic transfer into the Cultural Triangle. In the afternoon, a village boat ride with sparkling wine on a quiet tank beneath Sigiriya.",
      ["Scenic transfer to the Cultural Triangle", "Afternoon village boat ride with sparkling wine"],
      "Sigiriya Luxury Villa"
    ),
    day(
      3,
      "Balloon, Lion Rock & Minneriya",
      "Sigiriya",
      "Seasonal sunrise balloon, climb of Sigiriya Rock, and an afternoon Minneriya elephant safari.",
      ["Sunrise hot air balloon flight (seasonal)", "Sigiriya Rock climb", "Minneriya safari"],
      "Sigiriya Luxury Villa"
    ),
    day(
      4,
      "Kandy — Gardens & Temple",
      "Kandy",
      "Spice gardens and Peradeniya Botanical Gardens en route to Kandy, then the evening ceremony at the Temple of the Tooth.",
      ["Spice gardens", "Peradeniya Botanical Gardens", "Temple of the Tooth ceremony"],
      "Kandy Hillside Hotel"
    ),
    day(
      5,
      "Scenic Train to Ella",
      "Ella",
      "The iconic first-class train through tea estates to Ella — one of Asia's most beautiful rail journeys.",
      ["First-class scenic train through tea estates to Ella"],
      "Ella Mountain Resort"
    ),
    day(
      6,
      "Ella Peaks & Nine Arches",
      "Ella",
      "Sunrise hike on Little Adam's Peak, a mindful walk to Nine Arches Bridge, and a private spa session in the afternoon.",
      ["Little Adam's Peak sunrise hike", "Nine Arches Bridge walk", "Private spa session"],
      "Ella Mountain Resort"
    ),
    day(
      7,
      "Yala Leopard Safari",
      "Yala",
      "Descend from the mountains to Yala. Afternoon leopard-tracking jeep safari, then night at a luxury tented camp.",
      ["Scenic mountain descent", "Afternoon leopard-tracking jeep safari"],
      "Yala Tented Safari Camp"
    ),
    day(
      8,
      "Morning Safari to Tangalle",
      "Tangalle",
      "A morning safari walk or game drive, then transfer to a secluded Tangalle luxury beach resort.",
      ["Morning safari walk", "Transfer to secluded luxury beach resort"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      9,
      "Beach Leisure & Candlelit BBQ",
      "Tangalle",
      "A full day at leisure. Sunset catamaran sail and a private candlelit beach barbecue to close the journey.",
      ["Day at leisure", "Sunset catamaran sail", "Private candlelit beach barbecue"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      10,
      "Departure",
      "Tangalle",
      "Morning leisure, then an expressway transfer to Colombo Airport with VIP lounge access.",
      ["Morning leisure", "Expressway transfer to Colombo Airport", "VIP lounge access"]
    ),
  ],
  faqs: [
    ...sharedFaqs,
    {
      question: "Is the hot air balloon flight guaranteed?",
      answer:
        "The sunrise balloon is seasonal and weather-dependent. If conditions do not allow, we arrange an alternative sunrise experience at Sigiriya or Pidurangala.",
    },
  ],
  published: true,
};

const grandIsland7 = {
  name: "The Grand Island - 7 Days",
  parentTourName: "The Grand Island",
  duration: { days: 7, nights: 6 },
  summary:
    "The complete spectrum of Sri Lanka in one luxurious week — Sigiriya and Minneriya, the Temple of the Tooth, tea country high tea, and a Galle Fort sunset with a beachfront barbecue.",
  route: ["Sigiriya", "Kandy", "Nuwara Eliya", "Galle Fort", "South Coast"],
  tags: ["culture", "wildlife", "luxury", "beach", "heritage"],
  heroImage: "",
  highlights: [
    "Flagship express route covering Sri Lanka's greatest highlights in one week",
    "Sigiriya Lion Rock climb and Minneriya wild elephant safari",
    "Private evening cultural blessing at the Temple of the Tooth",
    "Estate tea plucking and historic high tea",
    "17th-century Galle Fort rampart sunset and beachfront candlelit dinner",
  ],
  placesToStay: [
    stay("Sigiriya", "Water Garden Sigiriya", "Luxury Eco-Resort"),
    stay("Sigiriya", "Jetwing Vil Uyana", "Boutique Eco-Resort"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Kandy", "Santani Wellness", "Boutique Wellness"),
    stay("Kandy", "Amaya Hills", "Good-Value Premium"),
    stay("Nuwara Eliya", "Ceylon Tea Trails", "Luxury Planter Bungalow"),
    stay("Galle Fort", "Amangalla", "Luxury Heritage Hotel"),
    stay("Galle", "The Fortress", "Boutique Resort"),
    stay("South Coast", "Weligama Bay Marriott", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Arrival into the Cultural Triangle",
      "Sigiriya",
      "VIP airport greeting and a private luxury transfer straight into the Cultural Triangle. Sunset welcome cocktails at your eco-resort.",
      ["VIP airport greeting", "Private luxury transfer into the Cultural Triangle", "Sunset welcome cocktail"],
      "Sigiriya Luxury Eco-Resort"
    ),
    day(
      2,
      "Sigiriya Rock & Minneriya Elephants",
      "Sigiriya",
      "Private climb of Sigiriya Lion Rock Fortress, then an afternoon jeep safari among wild elephants at Minneriya.",
      ["Private climb of Sigiriya Lion Rock Fortress", "Afternoon Minneriya elephant safari"],
      "Sigiriya Luxury Eco-Resort"
    ),
    day(
      3,
      "Spice Gardens & Kandy Temple",
      "Kandy",
      "Spice garden tour and a scenic drive to Kandy. A private evening visit to the Temple of the Tooth.",
      ["Spice garden tour", "Scenic drive to Kandy", "Private evening Temple of the Tooth tour"],
      "Kandy Hillside Boutique Hotel"
    ),
    day(
      4,
      "Botanical Gardens & Tea High Tea",
      "Nuwara Eliya",
      "Peradeniya botanical walk, mountain ascent to Nuwara Eliya, historic tea factory masterclass, and colonial high tea.",
      ["Peradeniya botanical walk", "Mountain ascent", "Historic tea factory masterclass and high tea"],
      "Nuwara Eliya Colonial Manor"
    ),
    day(
      5,
      "Descent to Galle Fort",
      "Galle Fort",
      "Scenic mountain descent to the south coast. Afternoon guided walking tour inside the walls of Galle Fort.",
      ["Scenic mountain descent to the south coast", "Afternoon guided walking tour of Galle Fort"],
      "Galle Fort Boutique Hotel"
    ),
    day(
      6,
      "South Coast Spa & Beach BBQ",
      "South Coast",
      "Morning beach leisure, an afternoon couple's spa, and a private beachfront candlelit barbecue.",
      ["Morning beach leisure", "Afternoon couple's spa", "Private beachfront candlelit barbecue"],
      "South Coast Beach Resort"
    ),
    day(
      7,
      "Departure",
      "South Coast",
      "Leisurely breakfast and boutique shopping, then an expressway transfer to the airport with VIP lounge access.",
      ["Leisurely breakfast", "Boutique shopping", "Expressway transfer to airport", "VIP lounge"]
    ),
  ],
  faqs: sharedFaqs,
  published: true,
};

// ---------------------------------------------------------------------------
// The Highland Zen
// ---------------------------------------------------------------------------

const highlandZen14 = {
  name: "The Highland Zen - 14 Days",
  parentTourName: "The Highland Zen",
  duration: { days: 14, nights: 13 },
  summary:
    "The ultimate two-week spiritual, mental, and physical reset — Cultural Triangle ruins, Kandy lake, Nuwara Eliya tea country, Ella Gap, Haputale cloud forests, and southern ocean wellness.",
  route: ["Kandy", "Sigiriya", "Nuwara Eliya", "Ella", "Haputale", "South Coast", "Colombo"],
  tags: ["wellness", "nature", "tea", "relaxation", "adventure"],
  heroImage: "",
  highlights: [
    "Multi-day mindful stops across ruins, Kandy lake, tea country, Ella Gap, Haputale cloud forests, and the southern ocean",
    "Comprehensive multi-day Ayurveda with certified doctors",
    "Private tea blending masterclass with estate planters",
    "Daily sound baths and sunset yoga in natural settings",
  ],
  placesToStay: [
    stay("Kandy", "Santani Wellness Resort", "Luxury Wellness"),
    stay("Kandy", "Amaya Hills", "Good-Value Premium"),
    stay("Nuwara Eliya", "Ceylon Tea Trails", "Luxury Planter Bungalow"),
    stay("Nuwara Eliya", "Goatfell", "Boutique Tea Bungalow"),
    stay("Nuwara Eliya", "Heritance Tea Factory", "Good-Value Premium"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Spa"),
    stay("South Coast", "Cape Weligama Spa", "Luxury Ocean Spa"),
    stay("South Coast", "Tri Lanka", "Boutique Lake Villa"),
    stay("South Coast", "Weligama Bay Marriott", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Kandy Mindfulness",
      "Kandy",
      "VIP airport greeting and a private transfer into the hills above Kandy. Evening mindfulness orientation at your wellness sanctuary.",
      ["VIP airport greeting", "Private transfer", "Evening mindfulness orientation"],
      "Kandy Wellness Sanctuary"
    ),
    day(
      2,
      "Quiet Transfer to Sigiriya",
      "Sigiriya",
      "Drive to the Cultural Triangle. Peaceful water-garden walks and evening meditation at an eco-villa.",
      ["Drive to the Cultural Triangle", "Peaceful water garden walks", "Evening meditation"],
      "Sigiriya Eco-Villa Resort"
    ),
    day(
      3,
      "Pidurangala Sunrise & Lake Safari",
      "Sigiriya",
      "Sunrise meditation on Pidurangala Rock, then a serene lake boat safari to observe birdlife without the rush of a game drive.",
      ["Sunrise meditation at Pidurangala Rock", "Serene lake boat safari observing birdlife"],
      "Sigiriya Eco-Villa Resort"
    ),
    day(
      4,
      "Ascent to Tea Country",
      "Nuwara Eliya",
      "Scenic ascent to Nuwara Eliya, botanical gardens, and a fireside herbal tea tasting at your mountain resort.",
      ["Scenic ascent to tea country", "Botanical gardens", "Fireside herbal tea tasting"],
      "Nuwara Eliya Mountain Resort"
    ),
    day(
      5,
      "Horton Plains Cloud Forest",
      "Nuwara Eliya",
      "Early guided trek through Horton Plains to World's End and Baker's Falls, then an afternoon Ayurvedic massage.",
      ["Early morning Horton Plains cloud forest trek", "Afternoon Ayurvedic massage"],
      "Nuwara Eliya Mountain Resort"
    ),
    day(
      6,
      "Private Tea Blending Retreat",
      "Nuwara Eliya",
      "A full day at an exclusive plantation bungalow — sensory tasting and a private blending session with a master planter.",
      ["Private tea blending retreat at an exclusive plantation bungalow"],
      "Nuwara Eliya Mountain Resort"
    ),
    day(
      7,
      "Ella Yoga & Sound Healing",
      "Ella",
      "Scenic mountain transfer to Ella. Evening yoga and sound healing overlooking the gap.",
      ["Scenic mountain transfer to Ella", "Evening yoga and sound healing"],
      "Ella Mountain Spa Resort"
    ),
    day(
      8,
      "Sunrise Yoga & Nine Arches",
      "Ella",
      "Sunrise yoga over Ella Gap and a mindful walk to Nine Arches Bridge.",
      ["Sunrise yoga overlooking Ella Gap", "Nine Arches Bridge mindful walk"],
      "Ella Mountain Spa Resort"
    ),
    day(
      9,
      "Haputale & Lipton's Seat",
      "Haputale",
      "Transfer into Haputale's cloud forests. Sunset contemplation at Lipton's Seat, where Sir Thomas Lipton surveyed his estates.",
      ["Transfer to Haputale", "Lipton's Seat sunset contemplation"],
      "Haputale Cloud Forest Lodge"
    ),
    day(
      10,
      "Waterfall Meditation & Herbal Walk",
      "Haputale",
      "Waterfall meditation and a village walk focused on herbal medicine and highland plants.",
      ["Waterfall meditation", "Herbal medicine village walk"],
      "Haputale Cloud Forest Lodge"
    ),
    day(
      11,
      "Descend to Ocean Wellness",
      "South Coast",
      "Descend to a tranquil southern ocean spa. Oceanfront yoga and hydrotherapy to shift from mountain to sea.",
      ["Descend to the southern coast", "Oceanfront yoga", "Hydrotherapy"],
      "South Coast Ocean Spa Resort"
    ),
    day(
      12,
      "Deep Ayurvedic Cleansing",
      "South Coast",
      "A full day of Ayurvedic cleansing menus, Shirodhara oil treatments, and beach meditation.",
      ["Ayurvedic cleansing menus", "Shirodhara oil treatments", "Beach meditation"],
      "South Coast Ocean Spa Resort"
    ),
    day(
      13,
      "Colombo Farewell Banquet",
      "Colombo",
      "Expressway to the capital. A farewell organic wellness banquet and a gentle cultural stroll.",
      ["Expressway drive to the capital", "Farewell organic wellness banquet", "Cultural stroll"],
      "Colombo Luxury Hotel"
    ),
    day(
      14,
      "Departure",
      "Colombo",
      "Final morning meditation, leisurely breakfast, airport transfer, and VIP lounge access.",
      ["Final morning meditation", "Leisurely breakfast", "Airport transfer", "VIP lounge"]
    ),
  ],
  faqs: sharedFaqs,
  published: true,
};

const highlandZen10 = {
  name: "The Highland Zen - 10 Days",
  parentTourName: "The Highland Zen",
  duration: { days: 10, nights: 9 },
  summary:
    "A deep restorative mountain retreat for wellness seekers and couples — extended stays in Kandy, Nuwara Eliya, Ella, and Haputale, closing on the south-coast ocean spa.",
  route: ["Kandy", "Nuwara Eliya", "Ella", "Haputale", "South Coast"],
  tags: ["wellness", "nature", "tea", "relaxation"],
  heroImage: "",
  highlights: [
    "Deep highland immersion across Kandy, Nuwara Eliya, Ella, and Haputale",
    "Exclusive sunrise tuk-tuk ascent to Lipton's Seat",
    "Guided silence walks through high-altitude cloud forest",
    "Herbal baths, steam therapies, and organic cleansing menus",
  ],
  placesToStay: [
    stay("Kandy", "Santani Wellness Resort", "Luxury Wellness"),
    stay("Kandy", "Amaya Hills", "Good-Value Premium"),
    stay("Nuwara Eliya", "Ceylon Tea Trails", "Luxury Planter Bungalow"),
    stay("Nuwara Eliya", "Goatfell", "Boutique Tea Bungalow"),
    stay("Nuwara Eliya", "Heritance Tea Factory", "Good-Value Premium"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Spa"),
    stay("Ella", "Nine Skies", "Good-Value Premium"),
    stay("South Coast", "Cape Weligama Spa", "Luxury Ocean Spa"),
    stay("South Coast", "Teardrop Hotels", "Boutique"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Kandy Meditation",
      "Kandy",
      "VIP airport greeting, private transfer to a Kandy wellness resort, and an evening meditation ceremony.",
      ["VIP airport greeting", "Private transfer", "Evening meditation ceremony"],
      "Kandy Wellness Resort"
    ),
    day(
      2,
      "Tea Country Ascent",
      "Nuwara Eliya",
      "Scenic mountain ascent, botanical gardens, and a tea estate masterclass.",
      ["Scenic mountain ascent", "Botanical gardens", "Tea estate masterclass"],
      "Nuwara Eliya Spa Hotel"
    ),
    day(
      3,
      "Horton Plains to World's End",
      "Nuwara Eliya",
      "Early Horton Plains trek to World's End, then afternoon rest and spa.",
      ["Early morning Horton Plains trek to World's End", "Afternoon rest and spa"],
      "Nuwara Eliya Spa Hotel"
    ),
    day(
      4,
      "Transfer to Ella",
      "Ella",
      "Scenic mountain transfer to Ella. Evening yoga and herbal tea tasting.",
      ["Scenic mountain transfer to Ella", "Evening yoga and herbal tea tasting"],
      "Ella Mountain Resort"
    ),
    day(
      5,
      "Sunrise Yoga & Sound Bath",
      "Ella",
      "Sunrise yoga, Nine Arches Bridge walk, and a sound-healing bath.",
      ["Sunrise yoga", "Nine Arches Bridge walk", "Sound healing bath"],
      "Ella Mountain Resort"
    ),
    day(
      6,
      "Ella Rock & Farm Dinner",
      "Ella",
      "Mindful trek to Ella Rock, waterfall meditation, and an organic farm dinner.",
      ["Ella Rock mindful trek", "Waterfall meditation", "Organic farm dinner"],
      "Ella Mountain Resort"
    ),
    day(
      7,
      "Haputale Cloud Forests",
      "Haputale",
      "Transfer to a Haputale cliffside eco-lodge and an afternoon tea plantation walk.",
      ["Transfer to Haputale cloud forests", "Afternoon tea plantation walk"],
      "Haputale Cliffside Eco-Lodge"
    ),
    day(
      8,
      "Lipton's Seat Sunrise",
      "Haputale",
      "Sunrise contemplation at Lipton's Seat and a village herbal medicine experience.",
      ["Sunrise contemplation at Lipton's Seat", "Village herbal medicine experience"],
      "Haputale Cliffside Eco-Lodge"
    ),
    day(
      9,
      "Oceanfront Ayurveda",
      "South Coast",
      "Descend to an oceanfront wellness sanctuary for a deep Ayurvedic Shirodhara treatment.",
      ["Descend to oceanfront wellness sanctuary", "Deep Ayurvedic Shirodhara treatment"],
      "South Coast Spa Resort"
    ),
    day(
      10,
      "Departure",
      "South Coast",
      "Morning meditation, leisurely breakfast, airport transfer, and VIP lounge access.",
      ["Morning meditation", "Leisurely breakfast", "Airport transfer", "VIP lounge access"]
    ),
  ],
  faqs: sharedFaqs,
  published: true,
};

const highlandZen7 = {
  name: "The Highland Zen - 7 Days",
  parentTourName: "The Highland Zen",
  duration: { days: 7, nights: 6 },
  summary:
    "A week to disconnect and rejuvenate — daily yoga over tea estates, Horton Plains silence trek, high-grown tea masterclass, and Ayurvedic treatments in Ella.",
  route: ["Kandy", "Nuwara Eliya", "Ella"],
  tags: ["wellness", "nature", "tea", "relaxation"],
  heroImage: "",
  highlights: [
    "Dedicated luxury vehicle with expert chauffeur-guide",
    "Daily open-air yoga overlooking misty tea estates",
    "Guided silence trek to World's End and Baker's Falls",
    "Sensory tea tasting at a historic high-grown estate",
    "Traditional herbal oil treatments and doctor consultations",
  ],
  placesToStay: [
    stay("Kandy", "Santani Wellness Resort", "Luxury Wellness"),
    stay("Kandy", "Amaya Hills", "Good-Value Premium"),
    stay("Nuwara Eliya", "Ceylon Tea Trails", "Luxury Planter Bungalow"),
    stay("Nuwara Eliya", "Goatfell", "Boutique Tea Bungalow"),
    stay("Nuwara Eliya", "Heritance Tea Factory", "Good-Value Premium"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Spa"),
    stay("Ella", "Mountain Heavens", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Lake Meditation",
      "Kandy",
      "VIP airport greeting and private transfer to a hillside wellness resort. Evening meditation overlooking misty Kandy Lake.",
      ["VIP airport greeting", "Private transfer", "Evening meditation overlooking misty lake"],
      "Kandy Hillside Wellness Resort"
    ),
    day(
      2,
      "Botanical Walk & Tea Masterclass",
      "Nuwara Eliya",
      "Peradeniya botanical walk, scenic mountain drive, historic tea factory masterclass, and high tea.",
      ["Peradeniya botanical walk", "Scenic mountain drive", "Historic tea factory masterclass and high tea"],
      "Nuwara Eliya Colonial Spa Hotel"
    ),
    day(
      3,
      "Horton Plains to Ella",
      "Ella",
      "Early Horton Plains silence trek, then a scenic transfer down to an Ella mountain sanctuary.",
      ["Early morning Horton Plains silence trek", "Scenic transfer down to Ella mountain retreat"],
      "Ella Mountain Sanctuary"
    ),
    day(
      4,
      "Hatha Yoga & Ella Rock",
      "Ella",
      "Sunrise Hatha yoga, mindful trek to Ella Rock, and a sound-bath healing session.",
      ["Sunrise Hatha yoga", "Mindful trek to Ella Rock", "Sound bath healing session"],
      "Ella Mountain Sanctuary"
    ),
    day(
      5,
      "Village Herbs & Ayurveda",
      "Ella",
      "Nine Arches Bridge walk, traditional village herbal medicine tour, and an Ayurvedic spa session.",
      ["Nine Arches Bridge walk", "Traditional village herbal medicine tour", "Ayurvedic spa session"],
      "Ella Mountain Sanctuary"
    ),
    day(
      6,
      "Ravana Falls & Herbal Treatments",
      "Ella",
      "Contemplation at Ravana Waterfalls and a full afternoon of Ayurvedic herbal treatments.",
      ["Contemplation at Ravana Waterfalls", "Full afternoon Ayurvedic herbal treatments"],
      "Ella Mountain Sanctuary"
    ),
    day(
      7,
      "Departure",
      "Ella",
      "Morning meditation, leisurely breakfast, scenic expressway transfer to the airport, and VIP lounge access.",
      ["Morning meditation", "Leisurely breakfast", "Scenic expressway transfer to airport", "VIP lounge"]
    ),
  ],
  faqs: sharedFaqs,
  published: true,
};

// ---------------------------------------------------------------------------
// Wild Lanka Family Expedition
// ---------------------------------------------------------------------------

const family14 = {
  name: "Wild Lanka Family Expedition - 14 Days",
  parentTourName: "Wild Lanka Family Expedition",
  duration: { days: 14, nights: 13 },
  summary:
    "The ultimate two-week family wildlife and beach holiday — ancient treasure hunts, elephant safaris, the hill-country train, Yala leopards, whales, surf lessons, and a Colombo museum finale.",
  route: [
    "Negombo",
    "Anuradhapura",
    "Sigiriya",
    "Kandy",
    "Nuwara Eliya",
    "Ella",
    "Yala",
    "South Coast",
    "Colombo",
  ],
  tags: ["family", "wildlife", "safari", "beach", "adventure"],
  heroImage: "",
  highlights: [
    "Comprehensive family route from Anuradhapura treasure hunt to south-coast beaches",
    "Two Yala wildlife safaris with family-friendly naturalists",
    "Private family whale-and-dolphin catamaran charter",
    "Colombo National Museum and a fun tuk-tuk city safari",
  ],
  placesToStay: [
    stay("Anuradhapura", "Uga Ulagalla", "Boutique Family Villa"),
    stay("Sigiriya", "Jetwing Vil Uyana", "Luxury Family Resort"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Kandy", "Tri Lanka", "Boutique"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Resort"),
    stay("Yala", "Wild Coast Tented Lodge", "Luxury Safari Lodge"),
    stay("Yala", "Cinnamon Wild", "Good-Value Premium"),
    stay("South Coast", "Shangri-La Hambantota", "Luxury Family Resort"),
    stay("South Coast", "Weligama Bay Marriott", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Family Arrival in Negombo",
      "Negombo",
      "VIP airport greeting and family resort check-in. A welcome fruit basket and pool time after the flight.",
      ["VIP airport greeting", "Family resort check-in", "Welcome fruit basket"],
      "Negombo Family Resort"
    ),
    day(
      2,
      "Anuradhapura Bicycle Treasure Hunt",
      "Anuradhapura",
      "Scenic drive to the ancient capital. A guided bicycle tour of sacred ruins and stupas designed as a family treasure hunt.",
      ["Scenic drive to the ancient capital", "Bicycle tour of sacred ruins and stupas"],
      "Anuradhapura Resort"
    ),
    day(
      3,
      "On to Sigiriya",
      "Sigiriya",
      "Morning ruins, transfer to a Sigiriya family resort, and evening pool relaxation.",
      ["Morning ruins tour", "Transfer to Sigiriya", "Evening pool relaxation"],
      "Sigiriya Family Resort"
    ),
    day(
      4,
      "Pidurangala, Elephants & Village Lunch",
      "Sigiriya",
      "A child-friendly Pidurangala climb, Minneriya elephant safari, and a traditional village lunch.",
      ["Pidurangala family climb", "Minneriya elephant safari", "Village lunch"],
      "Sigiriya Family Resort"
    ),
    day(
      5,
      "Kandy Gardens & Temple",
      "Kandy",
      "Spice gardens, Botanical Gardens, and the Temple of the Tooth evening ceremony.",
      ["Spice gardens", "Botanical Gardens", "Temple of the Tooth ceremony"],
      "Kandy Hillside Hotel"
    ),
    day(
      6,
      "Kids' Tea Plucking Challenge",
      "Nuwara Eliya",
      "Scenic mountain drive to Nuwara Eliya. Children compete with miniature baskets on a tea-plucking challenge.",
      ["Scenic mountain drive", "Kids' tea plucking competition with miniature baskets"],
      "Nuwara Eliya Family Hotel"
    ),
    day(
      7,
      "Blue Train & Nine Arches",
      "Ella",
      "First-class scenic train to Ella and a walk to Nine Arches Bridge.",
      ["First-class scenic train journey to Ella", "Nine Arches Bridge walk"],
      "Ella Mountain Resort"
    ),
    day(
      8,
      "Yala Leopard Safari",
      "Yala",
      "Drive to Yala and an afternoon leopard-tracking jeep safari with a family-friendly naturalist.",
      ["Drive to Yala", "Afternoon leopard-tracking wildlife jeep safari"],
      "Yala Tented Safari Camp"
    ),
    day(
      9,
      "Second Safari & Stargazing",
      "Yala",
      "Morning jeep safari, bush breakfast, and evening campfire stargazing.",
      ["Morning jeep safari", "Bush breakfast", "Evening campfire stargazing"],
      "Yala Tented Safari Camp"
    ),
    day(
      10,
      "South Coast Beach Day",
      "South Coast",
      "Transfer to a luxury family beach resort for swimming and boogie boarding.",
      ["Transfer to luxury beach resort", "Swimming", "Boogie boarding"],
      "South Coast Beach Resort"
    ),
    day(
      11,
      "Whales & Turtle Hatchery",
      "South Coast",
      "Whale and dolphin watching by boat, then an educational visit to a turtle hatchery.",
      ["Whale and dolphin watching boat trip", "Turtle hatchery visit"],
      "South Coast Beach Resort"
    ),
    day(
      12,
      "Family Surf Lessons",
      "South Coast",
      "Beginner family surf lessons in Weligama Bay and beach games.",
      ["Family surf lessons in Weligama Bay", "Beach games"],
      "South Coast Beach Resort"
    ),
    day(
      13,
      "Colombo Museum & Tuk-Tuk",
      "Colombo",
      "Drive to the capital. National Museum dinosaur exhibits, a tuk-tuk city tour, and a farewell family dinner.",
      ["Drive to the capital", "National Museum dinosaur exhibits", "Tuk-tuk city tour", "Farewell dinner"],
      "Colombo Family City Hotel"
    ),
    day(
      14,
      "Departure",
      "Colombo",
      "Leisurely breakfast, airport transfer, and VIP lounge access.",
      ["Leisurely breakfast", "Airport transfer", "VIP lounge access"]
    ),
  ],
  faqs: [
    ...sharedFaqs,
    {
      question: "Is this itinerary suitable for young children?",
      answer:
        "Yes. Driving days are broken with stops, climbs such as Pidurangala are child-friendly, and resorts are chosen for pools and family rooms. Baby seats and interconnecting rooms can be arranged in advance.",
    },
  ],
  published: true,
};

const family10 = {
  name: "Wild Lanka Family Expedition - 10 Days",
  parentTourName: "Wild Lanka Family Expedition",
  duration: { days: 10, nights: 9 },
  summary:
    "An immersive wildlife, mountain, and beach adventure for families with children and teenagers — elephants, the Blue Train, Udawalawe babies, whales, and Weligama surf.",
  route: ["Negombo", "Sigiriya", "Kandy", "Ella", "Udawalawe", "Weligama"],
  tags: ["family", "wildlife", "safari", "beach", "adventure"],
  heroImage: "",
  highlights: [
    "Elephant tracking in Minneriya and a Pidurangala family climb",
    "Reserved first-class observation seats on the Blue Train to Ella",
    "Udawalawe Elephant Transit Home feeding session",
    "Whale watching and beginner surf lessons in Weligama Bay",
  ],
  placesToStay: [
    stay("Sigiriya", "Jetwing Vil Uyana", "Luxury Family Resort"),
    stay("Sigiriya", "Jetwing Lake", "Boutique"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Resort"),
    stay("Nuwara Eliya", "Goatfell", "Boutique"),
    stay("Udawalawe", "Cinnamon Wild", "Good-Value Premium Safari"),
    stay("South Coast", "Shangri-La Hambantota", "Luxury Family Resort"),
    stay("South Coast", "Tri Lanka", "Boutique Lake Villa"),
    stay("South Coast", "Weligama Bay Marriott", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Family Arrival in Negombo",
      "Negombo",
      "VIP airport pickup, family resort check-in, and pool relaxation.",
      ["VIP airport pickup", "Family resort check-in", "Pool relaxation"],
      "Negombo Family Resort"
    ),
    day(
      2,
      "Cultural Triangle Village",
      "Sigiriya",
      "Scenic drive to the Cultural Triangle and an afternoon village tour.",
      ["Scenic drive to the Cultural Triangle", "Afternoon village tour"],
      "Sigiriya Family Resort"
    ),
    day(
      3,
      "Caves, Pidurangala & Elephants",
      "Sigiriya",
      "Dambulla Cave Temple, Pidurangala family climb, and Minneriya elephant safari.",
      ["Dambulla Caves", "Pidurangala family climb", "Minneriya elephant safari"],
      "Sigiriya Family Resort"
    ),
    day(
      4,
      "Kandy Gardens & Dance Show",
      "Kandy",
      "Spice gardens, Botanical Gardens, and an evening cultural dance performance.",
      ["Spice gardens", "Botanical Gardens", "Evening cultural dance performance"],
      "Kandy Hillside Hotel"
    ),
    day(
      5,
      "Blue Train to Ella",
      "Ella",
      "The iconic blue train through tea country to an Ella family resort.",
      ["Iconic blue train journey through tea country to Ella"],
      "Ella Family Resort"
    ),
    day(
      6,
      "Bridges, Falls & Optional Zip-line",
      "Ella",
      "Nine Arches Bridge, Ravana waterfalls, and optional ziplining for teens.",
      ["Nine Arches Bridge walk", "Ravana waterfalls", "Ziplining for teens (optional)"],
      "Ella Family Resort"
    ),
    day(
      7,
      "Udawalawe Elephants",
      "Udawalawe",
      "Drive south to the Elephant Transit Home feeding session and an afternoon safari.",
      ["Drive south", "Elephant Transit Home feeding session", "Afternoon safari"],
      "Udawalawe Safari Lodge"
    ),
    day(
      8,
      "Weligama Beach",
      "South Coast",
      "Transfer to a south-coast beach resort for swimming and beach games.",
      ["Transfer to south coast beach resort", "Afternoon swimming and beach games"],
      "South Coast Beach Resort"
    ),
    day(
      9,
      "Whales & Family Surf",
      "South Coast",
      "Seasonal whale-watching boat trip and a private family surf lesson in Weligama Bay.",
      ["Whale watching boat trip (seasonal)", "Private family surf lesson in Weligama Bay"],
      "South Coast Beach Resort"
    ),
    day(
      10,
      "Departure",
      "South Coast",
      "Morning beach swim, souvenir shopping, and expressway transfer to the airport.",
      ["Morning beach swim", "Souvenir shopping", "Expressway transfer to airport"]
    ),
  ],
  faqs: [
    ...sharedFaqs,
    {
      question: "Is whale watching seasonal?",
      answer:
        "Blue whale sightings are most reliable from December to April off Mirissa. If the season or sea state does not allow, we substitute a dolphin cruise or a longer beach morning.",
    },
  ],
  published: true,
};

const family7 = {
  name: "Wild Lanka Family Expedition - 7 Days",
  parentTourName: "Wild Lanka Family Expedition",
  duration: { days: 7, nights: 6 },
  summary:
    "A balanced, educational family week with reasonable driving times — Minneriya elephants, Pidurangala, Kandy culture, an ethical turtle hatchery, and south-coast beach fun.",
  route: ["Negombo", "Sigiriya", "Kandy", "South Coast"],
  tags: ["family", "wildlife", "safari", "beach"],
  heroImage: "",
  highlights: [
    "Dedicated child-friendly chauffeur-guide and spacious air-conditioned family van",
    "Open-top jeep safari to wild Asian elephants in Minneriya",
    "Child-friendly Pidurangala hike with views of Sigiriya",
    "Educational visit to a sea turtle rescue project",
    "Safe swimming, boogie boarding, and a family cooking class",
  ],
  placesToStay: [
    stay("Sigiriya", "Heritance Kandalama", "Luxury Family Resort"),
    stay("Sigiriya", "Jetwing Lake", "Boutique"),
    stay("Sigiriya", "Aliya Resort & Spa", "Good-Value Premium"),
    stay("South Coast", "Shangri-La Hambantota", "Luxury Family Resort with Water Park"),
    stay("South Coast", "Apa Villa Thalpe", "Boutique Villa"),
    stay("South Coast", "Centara Ceysands Resort & Spa", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Family Arrival in Negombo",
      "Negombo",
      "VIP airport greeting, private family transfer, pool relaxation, and a welcome fruit tasting.",
      ["VIP airport greeting", "Private family transfer", "Pool relaxation", "Welcome fruit tasting"],
      "Negombo Family Resort"
    ),
    day(
      2,
      "Minneriya Elephant Safari",
      "Sigiriya",
      "Scenic drive to the Cultural Triangle and an afternoon family elephant safari in Minneriya National Park.",
      ["Scenic drive to the Cultural Triangle", "Afternoon family elephant safari in Minneriya"],
      "Sigiriya Family Pool Resort"
    ),
    day(
      3,
      "Pidurangala & Village Ride",
      "Sigiriya",
      "Morning family climb of Pidurangala Rock, then a traditional village bullock-cart and catamaran ride.",
      ["Morning family climb of Pidurangala Rock", "Traditional village bullock cart and catamaran ride"],
      "Sigiriya Family Pool Resort"
    ),
    day(
      4,
      "Kandy Gardens & Dance Show",
      "Kandy",
      "Spice garden, Peradeniya Botanical Gardens, and an evening VIP family cultural dance show.",
      ["Spice garden tour", "Peradeniya Botanical Gardens", "Evening VIP family cultural dance show"],
      "Kandy Hillside Hotel with Pool"
    ),
    day(
      5,
      "South Coast & Turtle Hatchery",
      "South Coast",
      "Scenic expressway transfer to southern beaches and an afternoon visit to an ethical turtle hatchery.",
      ["Scenic expressway transfer to southern beaches", "Afternoon visit to ethical turtle hatchery"],
      "South Coast Family Beach Resort"
    ),
    day(
      6,
      "Beach Fun, Cooking & BBQ",
      "South Coast",
      "Morning swimming and water sports, a private family cooking class, and a farewell beach barbecue.",
      ["Morning beach swimming and water sports", "Private family cooking class", "Farewell beach BBQ"],
      "South Coast Family Beach Resort"
    ),
    day(
      7,
      "Departure",
      "South Coast",
      "Leisurely breakfast, pool time, expressway transfer to Colombo Airport, and VIP departure assistance.",
      ["Leisurely breakfast", "Pool time", "Expressway transfer to Colombo Airport", "VIP departure assistance"]
    ),
  ],
  faqs: [
    ...sharedFaqs,
    {
      question: "Are driving times suitable for children?",
      answer:
        "This 7-day route is paced for families. The longest transfer uses the southern expressway. Child seats, extra stops, and interconnecting rooms can be arranged.",
    },
  ],
  published: true,
};

// ---------------------------------------------------------------------------
// Ceylon Romance & Heritage
// ---------------------------------------------------------------------------

const romance14 = {
  name: "Ceylon Romance & Heritage - 14 Days",
  parentTourName: "Ceylon Romance & Heritage",
  duration: { days: 14, nights: 13 },
  summary:
    "The pinnacle of Sri Lankan luxury, heritage, and romance — ancient ruins, balloon sunrise, tea high tea, Yala glamping, Galle Fort, and secluded Tangalle villas.",
  route: [
    "Negombo",
    "Anuradhapura",
    "Sigiriya",
    "Kandy",
    "Nuwara Eliya",
    "Ella",
    "Yala",
    "Galle Fort",
    "Tangalle",
    "Colombo",
  ],
  tags: ["romance", "honeymoon", "culture", "heritage", "luxury", "beach"],
  heroImage: "",
  highlights: [
    "Grand masterpiece route from Anuradhapura to Tangalle and Colombo",
    "Seasonal sunrise balloon over the ancient royal capitals",
    "Private estate blending session and colonial high tea",
    "Luxury tented camp with a private bush barbecue under the stars",
    "Multiple nights of seclusion in top-tier coastal resorts",
  ],
  placesToStay: [
    stay("Anuradhapura", "Uga Ulagalla", "Boutique Villa"),
    stay("Sigiriya", "Jetwing Vil Uyana", "Boutique Eco-Resort"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Nuwara Eliya", "Ceylon Tea Trails", "Luxury Planter Bungalow"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Resort"),
    stay("Yala", "Wild Coast Tented Lodge", "Luxury Safari Lodge"),
    stay("Yala", "Cinnamon Wild", "Good-Value Premium"),
    stay("Galle Fort", "Amangalla", "Luxury Heritage Hotel"),
    stay("Tangalle", "Amanwella", "Luxury Beach Resort"),
    stay("Tangalle", "The Last House", "Boutique Beach Villa"),
    stay("Tangalle", "Anantara Peace Haven", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Sunset Cocktails",
      "Negombo",
      "VIP airport greeting, private luxury transfer, and sunset welcome cocktails at a Negombo boutique resort.",
      ["VIP airport greeting", "Private luxury transfer", "Sunset welcome cocktails"],
      "Negombo Boutique Resort"
    ),
    day(
      2,
      "Anuradhapura at Dusk",
      "Anuradhapura",
      "Scenic drive to the ancient capital, a sacred Bodhi tree walk, and a sunset ruins tour.",
      ["Scenic drive to the ancient capital", "Sacred Bodhi tree walk", "Sunset ruins tour"],
      "Anuradhapura Luxury Villa"
    ),
    day(
      3,
      "Sigiriya Spa Evening",
      "Sigiriya",
      "Morning ruins exploration, transfer to Sigiriya, and an evening couple's spa treatment.",
      ["Morning ruins exploration", "Transfer to Sigiriya", "Evening spa treatment"],
      "Sigiriya Luxury Eco-Resort"
    ),
    day(
      4,
      "Balloon, Lion Rock & Lake",
      "Sigiriya",
      "Seasonal sunrise balloon, Sigiriya Rock climb, and a private lake boat ride.",
      ["Sunrise hot air balloon flight (seasonal)", "Sigiriya Rock climb", "Lake boat ride"],
      "Sigiriya Luxury Eco-Resort"
    ),
    day(
      5,
      "Kandy Gardens & Temple",
      "Kandy",
      "Spice gardens, Peradeniya Botanical Gardens, and the Temple of the Tooth ceremony.",
      ["Spice gardens", "Peradeniya Botanical Gardens", "Temple of the Tooth ceremony"],
      "Kandy Hillside Hotel"
    ),
    day(
      6,
      "Colonial High Tea",
      "Nuwara Eliya",
      "Scenic hill ascent, historic tea factory masterclass, and traditional high tea.",
      ["Scenic hill ascent", "Historic tea factory masterclass", "Traditional high tea"],
      "Nuwara Eliya Colonial Manor"
    ),
    day(
      7,
      "Train through Tea Estates",
      "Ella",
      "First-class scenic train through tea estates and an evening wander through Ella town.",
      ["First-class scenic train journey through tea estates", "Evening in Ella town"],
      "Ella Mountain Resort"
    ),
    day(
      8,
      "Yala Glamping Safari",
      "Yala",
      "Mountain descent to Yala and an afternoon leopard-tracking jeep safari.",
      ["Mountain descent to Yala", "Afternoon leopard-tracking jeep safari"],
      "Yala Luxury Tented Camp"
    ),
    day(
      9,
      "Bush Breakfast & Camp Leisure",
      "Yala",
      "Morning jeep safari, bush breakfast, and a leisurely afternoon at the luxury glamping camp.",
      ["Morning jeep safari", "Bush breakfast", "Afternoon leisure at luxury glamping camp"],
      "Yala Luxury Tented Camp"
    ),
    day(
      10,
      "Galle Fort Sunset Walk",
      "Galle Fort",
      "Drive to the south coast for a historic Galle Fort walking tour and rampart sunset.",
      ["Drive to the south coast", "Historic Galle Fort walking tour", "Rampart sunset"],
      "Galle Fort Boutique Hotel"
    ),
    day(
      11,
      "Tangalle Ayurveda Day",
      "Tangalle",
      "Transfer to a secluded beach resort for a couple's Ayurveda spa day.",
      ["Transfer to secluded beach resort", "Couple's Ayurveda spa day"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      12,
      "Secluded Romance at Sea",
      "Tangalle",
      "Day at leisure, coastal relaxation, and a sunset catamaran cruise.",
      ["Day at leisure", "Coastal relaxation", "Sunset catamaran cruise"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      13,
      "Colombo Heritage & Shopping",
      "Colombo",
      "Expressway to the capital for colonial heritage architecture and a high-end shopping tour.",
      ["Expressway drive to the capital", "Colonial heritage architecture", "High-end shopping tour"],
      "Colombo Luxury City Hotel"
    ),
    day(
      14,
      "Departure",
      "Colombo",
      "Leisurely breakfast, private transfer to Colombo Airport, and VIP lounge access.",
      ["Leisurely breakfast", "Private transfer to Colombo Airport", "VIP lounge access"]
    ),
  ],
  faqs: [
    ...sharedFaqs,
    {
      question: "Can this be arranged as a honeymoon?",
      answer:
        "Yes. We can add flower turndowns, private dinners, champagne picnics, and spa credits. Tell your designer your anniversary or wedding dates when you enquire.",
    },
  ],
  published: true,
};

const romance10 = {
  name: "Ceylon Romance & Heritage - 10 Days",
  parentTourName: "Ceylon Romance & Heritage",
  duration: { days: 10, nights: 9 },
  summary:
    "A balanced immersive luxury journey for couples — Sigiriya and Dambulla, the Blue Train, Ella Gap sunrise breakfast, Galle Fort evenings, and secluded Tangalle.",
  route: ["Negombo", "Sigiriya", "Kandy", "Ella", "Galle Fort", "Tangalle"],
  tags: ["romance", "honeymoon", "culture", "heritage", "luxury", "beach"],
  heroImage: "",
  highlights: [
    "Private exploration of ancient Sigiriya and Dambulla",
    "First-class observation cabin through misty tea mountains to Ella",
    "Sunrise breakfast overlooking Ella Gap and a private hill-country spa",
    "Evening charm inside the historic walls of Galle Fort",
    "Pure romance on Tangalle's golden sands",
  ],
  placesToStay: [
    stay("Sigiriya", "Jetwing Vil Uyana", "Boutique Villa"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Anuradhapura", "Uga Ulagalla", "Boutique Villa"),
    stay("Kandy", "Amaya Hills", "Good-Value Premium"),
    stay("Ella", "98 Acres Resort & Spa", "Luxury Mountain Resort"),
    stay("Galle Fort", "Amangalla", "Luxury Heritage Hotel"),
    stay("Tangalle", "Amanwella", "Luxury Beach Resort"),
    stay("Tangalle", "The Last House", "Boutique Beach Villa"),
    stay("Tangalle", "Anantara Peace Haven", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Poolside Cocktails",
      "Negombo",
      "VIP airport greeting, private luxury transfer, and sunset welcome cocktails by the pool.",
      ["VIP airport greeting", "Private luxury transfer", "Sunset welcome cocktails by the pool"],
      "Negombo Boutique Resort"
    ),
    day(
      2,
      "Lake Boat with Sparkling Wine",
      "Sigiriya",
      "Scenic transfer to the Cultural Triangle and a private lake boat ride with sparkling wine.",
      ["Scenic transfer to the Cultural Triangle", "Afternoon private lake boat ride with sparkling wine"],
      "Sigiriya Luxury Villa"
    ),
    day(
      3,
      "Sigiriya Rock & Dambulla Caves",
      "Sigiriya",
      "Early Sigiriya Rock Fortress climb and an afternoon Dambulla Cave Temple tour.",
      ["Early morning Sigiriya Rock Fortress climb", "Afternoon Dambulla Cave Temple tour"],
      "Sigiriya Luxury Villa"
    ),
    day(
      4,
      "Kandy Temple Evening",
      "Kandy",
      "Spice garden tour, scenic drive to Kandy, and the evening Temple of the Tooth ceremony.",
      ["Spice garden tour", "Scenic drive to Kandy", "Evening Temple of the Tooth ceremony"],
      "Kandy Hillside Hotel"
    ),
    day(
      5,
      "Blue Train to Ella",
      "Ella",
      "Iconic first-class scenic train through tea estates to Ella.",
      ["Iconic first-class scenic train journey through tea estates to Ella"],
      "Ella Mountain Resort"
    ),
    day(
      6,
      "Ella Gap Sunrise Breakfast",
      "Ella",
      "Private sunrise breakfast overlooking Ella Gap, Nine Arches Bridge walk, and a couple's spa.",
      ["Private sunrise breakfast overlooking Ella Gap", "Nine Arches Bridge walk", "Couple's spa"],
      "Ella Mountain Resort"
    ),
    day(
      7,
      "Galle Fort Rampart Sunset",
      "Galle Fort",
      "Scenic mountain descent to the south coast and an afternoon Galle Fort rampart sunset walk.",
      ["Scenic mountain descent to the south coast", "Afternoon Galle Fort rampart sunset walk"],
      "Galle Fort Boutique Hotel"
    ),
    day(
      8,
      "Tangalle Beach Pavilion",
      "Tangalle",
      "Transfer to a secluded luxury beach resort and a couple's beach pavilion massage.",
      ["Transfer to secluded luxury beach resort", "Couple's beach pavilion massage"],
      "Tangalle Luxury Resort"
    ),
    day(
      9,
      "Lagoon, Leisure & Butler BBQ",
      "Tangalle",
      "Day at leisure, optional lagoon safari, and a private candlelit beach barbecue with butler service.",
      ["Day at leisure", "Optional lagoon safari", "Private candlelit beach barbecue with butler"],
      "Tangalle Luxury Resort"
    ),
    day(
      10,
      "Departure",
      "Tangalle",
      "Morning leisure, expressway transfer to Colombo Airport, and VIP lounge access.",
      ["Morning leisure", "Expressway transfer to Colombo Airport", "VIP lounge access"]
    ),
  ],
  faqs: sharedFaqs,
  published: true,
};

const romance7 = {
  name: "Ceylon Romance & Heritage - 7 Days",
  parentTourName: "Ceylon Romance & Heritage",
  duration: { days: 7, nights: 6 },
  summary:
    "An elegant, slow-paced luxury week — Pidurangala champagne picnic, Temple of the Tooth blessing, Nuwara Eliya tea masterclass, and a Galle Fort rampart sunset.",
  route: ["Negombo", "Sigiriya", "Kandy", "Nuwara Eliya", "Galle Fort", "South Coast"],
  tags: ["romance", "honeymoon", "culture", "heritage", "luxury"],
  heroImage: "",
  highlights: [
    "Dedicated luxury air-conditioned vehicle with expert English-speaking guide",
    "Private champagne sunset picnic overlooking Sigiriya from Pidurangala",
    "Private evening cultural blessing at the Temple of the Tooth",
    "Private tea plucking and sensory tasting in Nuwara Eliya",
    "Romantic sunset walk along 17th-century colonial ramparts",
  ],
  placesToStay: [
    stay("Sigiriya", "Water Garden Sigiriya", "Luxury Eco-Resort"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Kandy", "Santani Wellness", "Boutique Wellness"),
    stay("Kandy", "Amaya Hills", "Good-Value Premium"),
    stay("Nuwara Eliya", "Ceylon Tea Trails", "Luxury Planter Bungalow"),
    stay("Nuwara Eliya", "Heritance Tea Factory", "Good-Value Premium"),
    stay("Galle Fort", "Amangalla", "Luxury Heritage Hotel"),
    stay("Galle", "The Fortress", "Boutique Resort"),
    stay("South Coast", "Tri Lanka", "Boutique Lake Villa"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Infinity-Pool Cocktails",
      "Negombo",
      "VIP airport greeting, private transfer, and sunset welcome cocktails by the infinity pool.",
      ["VIP airport greeting", "Private transfer", "Sunset welcome cocktails by the infinity pool"],
      "Negombo Boutique Resort"
    ),
    day(
      2,
      "Pidurangala Champagne Picnic",
      "Sigiriya",
      "Scenic transfer to the Cultural Triangle and a private Pidurangala climb with a champagne picnic overlooking Lion Rock.",
      ["Scenic transfer to the Cultural Triangle", "Private Pidurangala Rock climb with champagne picnic"],
      "Sigiriya Luxury Jungle Villa"
    ),
    day(
      3,
      "Dambulla Caves & Kandy Temple",
      "Kandy",
      "Dambulla Cave Temple, scenic drive to Kandy, and a private evening Temple of the Tooth tour.",
      ["Dambulla Cave Temple visit", "Scenic drive to Kandy", "Private evening Temple of the Tooth tour"],
      "Kandy Hillside Boutique Hotel"
    ),
    day(
      4,
      "Tea Country High Tea",
      "Nuwara Eliya",
      "Peradeniya Botanical Gardens, scenic mountain ascent, historic tea factory masterclass, and high tea.",
      ["Peradeniya Botanical Gardens", "Scenic mountain ascent", "Historic tea factory masterclass and high tea"],
      "Nuwara Eliya Colonial Manor"
    ),
    day(
      5,
      "Romantic Galle Fort Walk",
      "Galle Fort",
      "Scenic mountain descent to the south coast and an afternoon guided romantic walking tour of Galle Fort.",
      ["Scenic mountain descent to the south coast", "Afternoon guided romantic walking tour of Galle Fort"],
      "Galle Fort Boutique Hotel"
    ),
    day(
      6,
      "Couple's Spa & Beach Barbecue",
      "South Coast",
      "Morning couple's Ayurvedic spa, afternoon at leisure, and a private candlelit beach barbecue.",
      ["Morning couple's Ayurvedic spa treatment", "Afternoon at leisure", "Private candlelit beach barbecue"],
      "Galle / South Coast Villa"
    ),
    day(
      7,
      "Departure",
      "Galle",
      "Leisurely breakfast, boutique shopping, expressway transfer to Colombo Airport, and VIP lounge access.",
      ["Leisurely breakfast", "Boutique shopping", "Expressway transfer to Colombo Airport", "VIP lounge access"]
    ),
  ],
  faqs: sharedFaqs,
  published: true,
};

// ---------------------------------------------------------------------------
// The Surf & Soul Odyssey
// ---------------------------------------------------------------------------

const surf14 = {
  name: "The Surf & Soul Odyssey - 14 Days",
  parentTourName: "The Surf & Soul Odyssey",
  duration: { days: 14, nights: 13 },
  summary:
    "The complete island adventure for active travelers — Cultural Triangle climbs, the Kandy-to-Ella train, Yala glamping, then an extended surf-and-yoga coast through Tangalle, Hiriketiya, and Weligama.",
  route: [
    "Negombo",
    "Sigiriya",
    "Kandy",
    "Ella",
    "Yala",
    "Tangalle",
    "Hiriketiya",
    "Weligama",
    "Galle Fort",
  ],
  tags: ["surf", "beach", "adventure", "wildlife", "relaxation"],
  heroImage: "",
  highlights: [
    "Ancient Cultural Triangle, hill country, wild safari, and the full southern surf coast",
    "Sigiriya and Pidurangala climbs plus seasonal hot air balloon",
    "Reserved first-class observation cabin from Kandy to Ella",
    "Luxury glamping and expert-led Yala leopard tracking",
    "Multi-stop coastal stay across Weligama, Hiriketiya, and Tangalle",
  ],
  placesToStay: [
    stay("Sigiriya", "Jetwing Vil Uyana", "Boutique Eco-Resort"),
    stay("Sigiriya", "Aliya Resort", "Good-Value Premium"),
    stay("Ella", "98 Acres Resort & Spa", "Boutique Mountain Resort"),
    stay("Yala", "Wild Coast Tented Lodge", "Luxury Safari Lodge"),
    stay("Yala", "Cinnamon Wild", "Good-Value Premium"),
    stay("Weligama", "Cape Weligama", "Luxury Clifftop"),
    stay("Weligama", "Ceylon Sliders", "Boutique Surf Hotel"),
    stay("Weligama", "Weligama Bay Marriott", "Good-Value Premium"),
    stay("Galle Fort", "Amangalla", "Luxury Heritage Hotel"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Negombo Sunset",
      "Negombo",
      "VIP airport greeting, private transfer, and a sunset welcome cocktail.",
      ["VIP airport greeting", "Private transfer", "Sunset welcome cocktail"],
      "Negombo Resort"
    ),
    day(
      2,
      "Pidurangala Sunset Climb",
      "Sigiriya",
      "Drive to the Cultural Triangle and an afternoon Pidurangala Rock climb for sunset views of Lion Rock.",
      ["Drive to the Cultural Triangle", "Afternoon Pidurangala Rock climb for sunset views"],
      "Sigiriya Eco-Resort"
    ),
    day(
      3,
      "Lion Rock, Elephants & Village Lunch",
      "Sigiriya",
      "Sigiriya Lion Rock climb, Minneriya elephant safari, and a village lunch.",
      ["Sigiriya Lion Rock fortress climb", "Minneriya elephant safari", "Village lunch"],
      "Sigiriya Eco-Resort"
    ),
    day(
      4,
      "Kandy Gardens & Temple",
      "Kandy",
      "Spice garden, Royal Botanical Gardens, and the Temple of the Tooth evening ceremony.",
      ["Spice garden tour", "Royal Botanical Gardens", "Temple of the Tooth evening ceremony"],
      "Kandy Hillside Hotel"
    ),
    day(
      5,
      "Train to Ella",
      "Ella",
      "Iconic first-class scenic train through tea estates to Ella.",
      ["Iconic first-class scenic train journey through tea estates to Ella"],
      "Ella Mountain Resort"
    ),
    day(
      6,
      "Little Adam's Peak & Nine Arches",
      "Ella",
      "Little Adam's Peak sunrise hike, Nine Arches Bridge, and a private mountain spa.",
      ["Little Adam's Peak sunrise hike", "Nine Arches Bridge", "Private mountain spa"],
      "Ella Mountain Resort"
    ),
    day(
      7,
      "Yala Block 1 Safari",
      "Yala",
      "Scenic mountain descent and an afternoon leopard-tracking safari in Yala Block 1.",
      ["Scenic mountain descent", "Afternoon leopard tracking safari in Yala Block 1"],
      "Yala Luxury Tented Camp"
    ),
    day(
      8,
      "Bush Walk to Tangalle",
      "Tangalle",
      "Morning bush walk or safari, then transfer to a pristine southern beach resort.",
      ["Morning bush walk or safari", "Transfer to pristine southern beach resort"],
      "Tangalle Luxury Resort"
    ),
    day(
      9,
      "Tangalle Leisure & Turtles",
      "Tangalle",
      "Day at leisure, spa treatments, and a seasonal evening turtle conservation walk.",
      ["Day at leisure", "Spa treatments", "Evening turtle conservation walk (seasonal)"],
      "Tangalle Luxury Resort"
    ),
    day(
      10,
      "Hiriketiya Horseshoe Bay",
      "Hiriketiya",
      "Transfer to Hiriketiya's horseshoe bay for jungle yoga, surfing, and bohemian café hopping.",
      ["Transfer to horseshoe bay", "Jungle yoga", "Surfing", "Bohemian café hopping"],
      "Hiriketiya Boutique Villa"
    ),
    day(
      11,
      "Weligama Surf & Stilt Fishermen",
      "Weligama",
      "Surf coaching, Ahangama boutique shopping, and stilt-fishermen photographs.",
      ["Surf coaching session", "Ahangama boutique shopping", "Stilt fishermen photos"],
      "Weligama Surf Hotel"
    ),
    day(
      12,
      "Galle Fort Heritage Day",
      "Weligama",
      "Galle Fort heritage walking tour, museum visits, and rampart sunset drinks.",
      ["Galle Fort heritage walking tour", "Museum visits", "Rampart sunset drinks"],
      "Weligama Surf Hotel"
    ),
    day(
      13,
      "Whales, Koggala Lake & Farewell BBQ",
      "Weligama",
      "Seasonal whale-watching boat trip, Koggala Lake safari, and a farewell beach barbecue.",
      ["Whale watching boat trip (seasonal)", "Koggala Lake safari", "Farewell beach BBQ"],
      "Weligama Surf Hotel"
    ),
    day(
      14,
      "Departure",
      "Weligama",
      "Leisurely breakfast, expressway transfer to Colombo Airport, and VIP lounge access.",
      ["Leisurely breakfast", "Expressway transfer to Colombo Airport", "VIP lounge access"]
    ),
  ],
  faqs: sharedFaqs,
  published: true,
};

const surf10 = {
  name: "The Surf & Soul Odyssey - 10 Days",
  parentTourName: "The Surf & Soul Odyssey",
  duration: { days: 10, nights: 9 },
  summary:
    "An immersive coastal journey for active couples, friends, and surf enthusiasts — Weligama and Hiriketiya surf-and-yoga days, Mirissa whales, Udawalawe elephants, and two nights of Tangalle seclusion.",
  route: ["Negombo", "Weligama", "Hiriketiya", "Tangalle"],
  tags: ["surf", "beach", "adventure", "wildlife", "relaxation"],
  heroImage: "",
  highlights: [
    "Seamless progression from Negombo lagoon to the south's premier surf and wellness hubs",
    "Extended time in Weligama and Hiriketiya for surf coaching and cliffside yoga",
    "Blue whale and dolphin watching in Mirissa",
    "Udawalawe jeep safari and Elephant Transit Home visit",
    "Two nights of absolute relaxation in Tangalle",
  ],
  placesToStay: [
    stay("Tangalle", "Amanwella", "Luxury Beach Resort"),
    stay("Weligama", "Cape Weligama", "Luxury Clifftop"),
    stay("Hiriketiya", "Jasper House", "Boutique Villa"),
    stay("Koggala", "Tri Lanka", "Boutique Lake Villa"),
    stay("Tangalle", "Anantara Peace Haven", "Good-Value Premium"),
    stay("Weligama", "Weligama Bay Marriott", "Good-Value Premium"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Lagoon Briefing",
      "Negombo",
      "VIP airport greeting, private transfer to a Negombo lagoon resort, sunset welcome mocktail, and trip briefing.",
      ["VIP airport greeting", "Private transfer", "Sunset welcome mocktail and briefing"],
      "Negombo Lagoon Resort"
    ),
    day(
      2,
      "Expressway to Galle & Weligama",
      "Weligama",
      "Scenic expressway drive, afternoon Galle Fort architecture walk, and rampart sunset before checking into Weligama.",
      ["Scenic expressway drive", "Galle Fort afternoon architecture walk", "Rampart sunset"],
      "Weligama Surf Hotel"
    ),
    day(
      3,
      "Surf Coaching & Beach Bonfire",
      "Weligama",
      "Morning surf coaching, Ahangama café hopping, and a sunset beach bonfire.",
      ["Morning surf coaching session", "Ahangama café hopping", "Sunset beach bonfire"],
      "Weligama Surf Hotel"
    ),
    day(
      4,
      "Free Surf & Hidden Coves",
      "Weligama",
      "Free surf day, scooter exploration of hidden coves, and a sunset photography session.",
      ["Free surf day", "Scooter exploration of hidden coves", "Sunset photography session"],
      "Weligama Surf Hotel"
    ),
    day(
      5,
      "Mirissa Whales to Hiriketiya",
      "Hiriketiya",
      "Morning whale-watching boat safari, then transfer to Hiriketiya horseshoe bay.",
      ["Morning whale watching boat safari", "Transfer to Hiriketiya horseshoe bay"],
      "Hiriketiya Boutique Villa"
    ),
    day(
      6,
      "Jungle Yoga & Paddleboarding",
      "Hiriketiya",
      "Jungle yoga, paddleboarding, and cliffside sunset drinks at a bohemian beach bar.",
      ["Jungle yoga", "Paddleboarding", "Cliffside sunset drinks at bohemian beach bar"],
      "Hiriketiya Boutique Villa"
    ),
    day(
      7,
      "Hidden Beaches & Starlit Dinner",
      "Hiriketiya",
      "Hidden beach trek, a local cooking experience, and starlit dinner by the shore.",
      ["Hidden beach trek", "Local cooking experience", "Starlit dinner by the shore"],
      "Hiriketiya Boutique Villa"
    ),
    day(
      8,
      "Udawalawe Safari to Tangalle",
      "Tangalle",
      "Udawalawe National Park elephant safari and Elephant Transit Home, then on to a Tangalle luxury beach resort.",
      ["Udawalawe National Park elephant safari", "Elephant Transit Home visit"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      9,
      "Tangalle Seclusion & Farewell BBQ",
      "Tangalle",
      "Pristine beach relaxation, optional seasonal sea-turtle nesting night walk, and a farewell barbecue.",
      ["Pristine beach relaxation", "Optional sea turtle nesting night walk (seasonal)", "Farewell BBQ"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      10,
      "Departure",
      "Tangalle",
      "Leisurely breakfast, expressway transfer to Colombo Airport, and VIP lounge access.",
      ["Leisurely breakfast", "Expressway transfer to Colombo Airport", "VIP lounge access"]
    ),
  ],
  faqs: [
    ...sharedFaqs,
    {
      question: "Do I need to be an experienced surfer?",
      answer:
        "No. Weligama is one of Sri Lanka's best beginner bays. Coaching is tailored to your level. Intermediate and advanced surfers can be taken to nearby reef and point breaks.",
    },
  ],
  published: true,
};

const surf7 = {
  name: "The Surf & Soul Odyssey - 7 Days",
  parentTourName: "The Surf & Soul Odyssey",
  duration: { days: 7, nights: 6 },
  summary:
    "A one-week coastal reset — Galle Fort, Weligama surf coaching, Hiriketiya yoga and café culture, and a secluded Tangalle finish with optional turtle walk.",
  route: ["Negombo", "Weligama", "Hiriketiya", "Tangalle"],
  tags: ["surf", "beach", "adventure", "relaxation"],
  heroImage: "",
  highlights: [
    "Express south-coast route built around surf, yoga, and slow beach days",
    "Professional surf coaching in Weligama Bay",
    "Jungle yoga and horseshoe-bay downtime in Hiriketiya",
    "Galle Fort rampart sunset and boutique streets",
    "Secluded Tangalle night with optional seasonal turtle walk",
  ],
  placesToStay: [
    stay("Weligama", "Cape Weligama", "Luxury Clifftop"),
    stay("Weligama", "Ceylon Sliders", "Boutique Surf Hotel"),
    stay("Weligama", "Weligama Bay Marriott", "Good-Value Premium"),
    stay("Hiriketiya", "Jasper House", "Boutique Villa"),
    stay("Tangalle", "Amanwella", "Luxury Beach Resort"),
    stay("Tangalle", "Anantara Peace Haven", "Good-Value Premium"),
    stay("Koggala", "Tri Lanka", "Boutique Lake Villa"),
  ],
  itinerary: [
    day(
      1,
      "Arrival & Galle Fort Sunset",
      "Weligama",
      "VIP airport greeting and an expressway transfer south. Afternoon Galle Fort walk and rampart sunset, then check-in at a Weligama surf hotel.",
      ["VIP airport greeting", "Expressway transfer south", "Galle Fort architecture walk", "Rampart sunset"],
      "Weligama Surf Hotel"
    ),
    day(
      2,
      "Surf Coaching & Café Culture",
      "Weligama",
      "Morning surf coaching in Weligama Bay, Ahangama café hopping, and a sunset beach bonfire.",
      ["Morning surf coaching session", "Ahangama café hopping", "Sunset beach bonfire"],
      "Weligama Surf Hotel"
    ),
    day(
      3,
      "Free Surf & Hidden Coves",
      "Weligama",
      "A free surf day to practise, scooter exploration of hidden coves, and sunset photography along the coast.",
      ["Free surf day", "Scooter exploration of hidden coves", "Sunset photography session"],
      "Weligama Surf Hotel"
    ),
    day(
      4,
      "Hiriketiya Yoga & Bay Rhythm",
      "Hiriketiya",
      "Transfer to Hiriketiya horseshoe bay. Jungle yoga, paddleboarding, and cliffside sunset drinks.",
      ["Transfer to Hiriketiya horseshoe bay", "Jungle yoga", "Paddleboarding", "Cliffside sunset drinks"],
      "Hiriketiya Boutique Villa"
    ),
    day(
      5,
      "Local Cooking & Starlit Dinner",
      "Hiriketiya",
      "Hidden beach trek, a local cooking experience, and starlit dinner by the shore.",
      ["Hidden beach trek", "Local cooking experience", "Starlit dinner by the shore"],
      "Hiriketiya Boutique Villa"
    ),
    day(
      6,
      "Tangalle Seclusion",
      "Tangalle",
      "Transfer to a secluded Tangalle beach resort. Pristine beach leisure, optional seasonal turtle walk, and a farewell barbecue.",
      ["Transfer to Tangalle luxury beach resort", "Beach leisure", "Optional sea turtle walk (seasonal)", "Farewell BBQ"],
      "Tangalle Luxury Beach Resort"
    ),
    day(
      7,
      "Departure",
      "Tangalle",
      "Leisurely breakfast, expressway transfer to Colombo Airport, and VIP lounge access.",
      ["Leisurely breakfast", "Expressway transfer to Colombo Airport", "VIP lounge access"]
    ),
  ],
  faqs: [
    ...sharedFaqs,
    {
      question: "Do I need to be an experienced surfer?",
      answer:
        "No. Weligama is one of Sri Lanka's best beginner bays. Coaching is tailored to your level.",
    },
  ],
  published: true,
};

const children = [
  grandIsland14,
  grandIsland10,
  grandIsland7,
  highlandZen14,
  highlandZen10,
  highlandZen7,
  family14,
  family10,
  family7,
  romance14,
  romance10,
  romance7,
  surf14,
  surf10,
  surf7,
];

async function seedFlagshipPackages() {
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error("Missing Firebase credentials in .env.local");
    process.exit(1);
  }

  console.log("Seeding flagship parent packages and itineraries...\n");

  const now = new Date().toISOString();
  const snapshot = await db.collection("tours").get();
  const existingByName = new Map();
  snapshot.docs.forEach((doc) => {
    const name = doc.data().name;
    if (name) existingByName.set(name, doc);
  });

  const allPackages = [...parents, ...children];
  const batch = db.batch();
  let created = 0;
  let updated = 0;

  for (const pkg of allPackages) {
    const existing = existingByName.get(pkg.name);
    if (existing) {
      batch.set(existing.ref, {
        ...pkg,
        createdAt: existing.data().createdAt || now,
        updatedAt: now,
      });
      updated += 1;
      console.log(`  Update: ${pkg.name}${pkg.parentTourName ? ` → ${pkg.parentTourName}` : " (parent)"}`);
    } else {
      batch.set(db.collection("tours").doc(), {
        ...pkg,
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
      console.log(`  Create: ${pkg.name}${pkg.parentTourName ? ` → ${pkg.parentTourName}` : " (parent)"}`);
    }
  }

  await batch.commit();
  console.log(`\nDone. Created ${created}, updated ${updated} (${allPackages.length} total).`);
  process.exit(0);
}

seedFlagshipPackages().catch((err) => {
  console.error("Error seeding flagship packages:", err);
  process.exit(1);
});