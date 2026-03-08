import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import type { Hotel } from "@/types";

const COLLECTION = "hotels";
const CACHE_TTL = 120;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const cacheKey = `hotels:all`;
    const cached = getCached<Hotel[]>(cacheKey);
    if (cached) {
      return Response.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    const snapshot = await adminDb.collection(COLLECTION).get();
    let hotels = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Hotel[];

    hotels.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    const search = searchParams.get("search")?.toLowerCase();
    if (search) {
      hotels = hotels.filter(
        (h) =>
          h.name?.toLowerCase().includes(search) ||
          h.location?.toLowerCase().includes(search)
      );
    }

    setCache(cacheKey, hotels, CACHE_TTL);

    return Response.json(hotels, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return Response.json({ error: "Failed to fetch hotels" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const hotelData = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection(COLLECTION).add(hotelData);

    invalidateCache("hotels:");

    return Response.json({ id: docRef.id, ...hotelData }, { status: 201 });
  } catch (error) {
    console.error("Error creating hotel:", error);
    return Response.json({ error: "Failed to create hotel" }, { status: 500 });
  }
}
