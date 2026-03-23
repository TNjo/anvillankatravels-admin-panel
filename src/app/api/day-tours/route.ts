import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { getCached, setCache, invalidateCache } from "@/lib/cache";
import { applyTranslations } from "@/lib/translate";
import type { DayTour } from "@/types";

const COLLECTION = "dayTours";
const TRANSLATIONS_COLLECTION = "translations";
const CACHE_TTL = 120;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";
    const lang = searchParams.get("lang");

    const cacheKey = `dayTours:${publishedOnly}:${lang || ""}`;
    const cached = getCached<DayTour[]>(cacheKey);
    if (cached) {
      return Response.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    const snapshot = await adminDb.collection(COLLECTION).get();
    let dayTours = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DayTour[];

    dayTours.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    if (publishedOnly) {
      dayTours = dayTours.filter((t) => t.published === true);
    }

    const search = searchParams.get("search")?.toLowerCase();
    if (search) {
      dayTours = dayTours.filter((t) =>
        t.name?.toLowerCase().includes(search)
      );
    }

    if (lang && lang !== "en") {
      const tourIds = dayTours.map((t) => t.id);
      const translationDocs = await Promise.all(
        tourIds.map((id) =>
          adminDb
            .collection(TRANSLATIONS_COLLECTION)
            .doc(`${COLLECTION}_${id}_${lang}`)
            .get()
        )
      );

      dayTours = dayTours.map((tour, idx) => {
        const transDoc = translationDocs[idx];
        if (transDoc.exists) {
          const transData = transDoc.data();
          if (transData?.fields) {
            return applyTranslations(
              tour as unknown as Record<string, unknown>,
              transData.fields
            ) as unknown as DayTour;
          }
        }
        return tour;
      });
    }

    setCache(cacheKey, dayTours, CACHE_TTL);

    return Response.json(dayTours, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching day tours:", error);
    return Response.json({ error: "Failed to fetch day tours" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "day-tours");
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

    invalidateCache("dayTours:");

    return Response.json({ id: docRef.id, ...tourData }, { status: 201 });
  } catch (error) {
    console.error("Error creating day tour:", error);
    return Response.json({ error: "Failed to create day tour" }, { status: 500 });
  }
}
