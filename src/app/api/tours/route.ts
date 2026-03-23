import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import { applyTranslations } from "@/lib/translate";
import type { Tour } from "@/types";

const COLLECTION = "tours";
const TRANSLATIONS_COLLECTION = "translations";
const CACHE_TTL = 120;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";
    const parentTourName = searchParams.get("parentTourName");
    const includeAll = searchParams.get("all") === "true";
    const lang = searchParams.get("lang");

    const cacheKey = `tours:${publishedOnly}:${parentTourName || ""}:${includeAll}:${lang || ""}`;
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

    if (lang && lang !== "en") {
      const tourIds = tours.map((t) => t.id);
      const translationDocs = await Promise.all(
        tourIds.map((id) =>
          adminDb
            .collection(TRANSLATIONS_COLLECTION)
            .doc(`${COLLECTION}_${id}_${lang}`)
            .get()
        )
      );

      tours = tours.map((tour, idx) => {
        const transDoc = translationDocs[idx];
        if (transDoc.exists) {
          const transData = transDoc.data();
          if (transData?.fields) {
            return applyTranslations(
              tour as unknown as Record<string, unknown>,
              transData.fields
            ) as unknown as Tour;
          }
        }
        return tour;
      });
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
  const { user, authorized } = await verifyAdminPermission(request, "tours");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

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
