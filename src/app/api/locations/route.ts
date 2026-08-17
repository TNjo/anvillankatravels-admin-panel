import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import type { Location } from "@/types";

const COLLECTION = "locations";
const CACHE_TTL = 120;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";

    const cacheKey = publishedOnly ? "locations:published" : "locations:all";
    const cached = getCached<Location[]>(cacheKey);
    if (cached) {
      return Response.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    const snapshot = await adminDb.collection(COLLECTION).get();
    let locations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Location[];

    if (publishedOnly) {
      locations = locations.filter((l) => l.published);
    }

    locations.sort((a, b) => a.name.localeCompare(b.name));

    const search = searchParams.get("search")?.toLowerCase();
    if (search) {
      locations = locations.filter(
        (l) =>
          l.name?.toLowerCase().includes(search) ||
          l.description?.toLowerCase().includes(search) ||
          l.category?.toLowerCase().includes(search)
      );
    }

    const category = searchParams.get("category");
    if (category) {
      locations = locations.filter((l) => l.category === category);
    }

    setCache(cacheKey, locations, CACHE_TTL);

    return Response.json(locations, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return Response.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "locations");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const locationData = {
      ...body,
      slug: generateSlug(body.name),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection(COLLECTION).add(locationData);

    invalidateCache("locations:");

    return Response.json({ id: docRef.id, ...locationData }, { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return Response.json({ error: "Failed to create location" }, { status: 500 });
  }
}
