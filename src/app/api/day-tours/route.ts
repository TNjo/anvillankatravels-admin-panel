import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import type { DayTour } from "@/types";

const COLLECTION = "dayTours";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";

    const snapshot = await adminDb.collection(COLLECTION).get();
    let dayTours = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DayTour[];

    if (publishedOnly) {
      dayTours = dayTours.filter((t) => t.published === true);
    }

    dayTours.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return Response.json(dayTours);
  } catch (error) {
    console.error("Error fetching day tours:", error);
    return Response.json({ error: "Failed to fetch day tours" }, { status: 500 });
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

    return Response.json({ id: docRef.id, ...tourData }, { status: 201 });
  } catch (error) {
    console.error("Error creating day tour:", error);
    return Response.json({ error: "Failed to create day tour" }, { status: 500 });
  }
}
