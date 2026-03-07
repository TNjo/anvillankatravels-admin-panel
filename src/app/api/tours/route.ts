import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import type { Tour } from "@/types";

const COLLECTION = "tours";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";
    const parentTourName = searchParams.get("parentTourName");
    const includeAll = searchParams.get("all") === "true";

    const snapshot = await adminDb.collection(COLLECTION).get();
    let tours = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Tour[];

    if (publishedOnly) {
      tours = tours.filter((t) => t.published === true);
    }

    if (!includeAll) {
      if (parentTourName) {
        // Return only sub-packages matching the parent tour name
        tours = tours.filter((t) => t.parentTourName === parentTourName);
      } else {
        // Exclude sub-packages from the main tour listing
        tours = tours.filter((t) => !t.parentTourName);
      }
    }

    tours.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return Response.json(tours);
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

    return Response.json({ id: docRef.id, ...tourData }, { status: 201 });
  } catch (error) {
    console.error("Error creating tour:", error);
    return Response.json({ error: "Failed to create tour" }, { status: 500 });
  }
}
