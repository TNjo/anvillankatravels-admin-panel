export interface TourDay {
  day: number;
  title: string;
  description: string;
  image: string;
  location: string;
  activities: string[];
  accommodation?: string;
}

export interface PlaceToStay {
  location: string;
  hotel: string;
  type: string;
  image?: string;
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
  tourName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfGuests: number;
  preferredDate: string;
  specialRequests?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
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
