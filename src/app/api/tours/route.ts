import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import type { Tour } from "@/types";

const COLLECTION = "tours";
const CACHE_TTL = 120; // 2 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";
    const parentTourName = searchParams.get("parentTourName");
    const includeAll = searchParams.get("all") === "true";

    const cacheKey = `tours:${publishedOnly}:${parentTourName || ""}:${includeAll}`;
    const cached = getCached<Tour[]>(cacheKey);
    if (cached) {
      return Response.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    const snapshot = await adminDb.collection(COLLECTION).get();
    let tours = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Tour[];

    // Sort by createdAt descending
    tours.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    if (publishedOnly) {
      tours = tours.filter((t) => t.published === true);
    }

    if (!includeAll) {
      if (parentTourName) {
        tours = tours.filter((t) => t.parentTourName === parentTourName);
      } else {
        tours = tours.filter((t) => !t.parentTourName);
      }
    }

    const search = searchParams.get("search")?.toLowerCase();
    if (search) {
      tours = tours.filter((t) =>
        t.name?.toLowerCase().includes(search)
      );
    }

    setCache(cacheKey, tours, CACHE_TTL);

    return Response.json(tours, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching tours:", error);
    return Response.json({ error: "Failed to fetch tours" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const tourData = {
      ...body,
      createdAt: now,
      updatedAt: now,
      published: body.published ?? false,
    };

    const docRef = await adminDb.collection(COLLECTION).add(tourData);

    invalidateCache("tours:");

    return Response.json({ id: docRef.id, ...tourData }, { status: 201 });
  } catch (error) {
    console.error("Error creating tour:", error);
    return Response.json({ error: "Failed to create tour" }, { status: 500 });
  }
}
