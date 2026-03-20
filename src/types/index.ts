export interface HotelRoomType {
  name: string;
  description: string;
  image?: string;
}

export interface HotelDistance {
  place: string;
  distance: string;
  duration: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  features: string[];
  roomTypes: HotelRoomType[];
  distances: HotelDistance[];
  mapCoordinates?: { lat: number; lng: number };
  starRating?: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TourDay {
  day: number;
  title: string;
  description: string;
  image: string;
  location: string;
  activities: string[];
  accommodation?: string;
  hotelId?: string;
  hotelIds?: string[];
}

export interface PlaceToStay {
  location: string;
  hotel: string;
  type: string;
  image?: string;
}

export interface TourFAQ {
  question: string;
  answer: string;
}

export interface Tour {
  id: string;
  name: string;
  duration: { days: number; nights: number };
  summary: string;
  route: string[];
  tags: string[];
  heroImage: string;
  highlights: string[];
  placesToStay: PlaceToStay[];
  itinerary: TourDay[];
  faqs?: TourFAQ[];
  parentTourName?: string;
  createdAt?: string;
  updatedAt?: string;
  published?: boolean;
}

export interface DayTourItineraryStep {
  title: string;
  description: string;
}

export interface DayTour {
  id: string;
  name: string;
  location: string;
  summary: string;
  overview: string;
  highlights: string[];
  heroImage: string;
  galleryImages: string[];
  duration: string;
  startsEnds: string;
  tourType: string;
  itinerary: DayTourItineraryStep[];
  inclusions: string[];
  exclusions: string[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  published?: boolean;
}

export interface Booking {
  id: string;
  tourId: string;
  tourType: "multi-day" | "day-tour" | "custom";
  tourName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry?: string;
  numberOfAdults: number;
  numberOfChildren?: number;
  childrenAges?: string;
  preferredDate: string;
  endDate?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  accommodationType?: "budget" | "mid-range" | "luxury" | "not-required";
  totalPrice?: number;
  currency?: string;
  depositPaid?: number;
  paymentStatus?: "unpaid" | "deposit-paid" | "fully-paid" | "refunded";
  specialRequests?: string;
  internalNotes?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "in-progress";
  createdAt: string;
  updatedAt: string;
}

export interface TailorMadeData {
  title?: string;
  arrivalDate?: string;
  departureDate?: string;
  pickupPlace?: string;
  groupSize?: string;
  numAdults?: string;
  ageGroupAdults?: string[];
  numChildren?: string;
  ageGroupChildren?: string[];
  tourDuration?: string;
  accommodation?: string;
  budgetRange?: string;
  interests?: string[];
  specialRequirements?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  type?: "inquiry" | "tailor-made" | "contact";
  country?: string;
  countryOther?: string;
  whatsapp?: string;
  dates?: string;
  selectedPackage?: string;
  tailorMade?: TailorMadeData;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface TravelMemory {
  id: string;
  imageUrl: string;
  title?: string;
  location?: string;
  caption?: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
