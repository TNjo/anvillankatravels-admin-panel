import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import type { TravelMemory } from "@/types";

const COLLECTION = "travelMemories";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";

    const snapshot = await adminDb.collection(COLLECTION).get();
    
    let memories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TravelMemory[];

    memories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (publishedOnly) {
      memories = memories.filter((m) => m.published === true);
    }

    return Response.json(memories, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("Error fetching travel memories:", error);
    return Response.json({ error: "Failed to fetch travel memories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const countSnapshot = await adminDb.collection(COLLECTION).count().get();
    const currentCount = countSnapshot.data().count;

    const memoryData: Omit<TravelMemory, "id"> = {
      imageUrl: body.imageUrl || "",
      title: body.title || "",
      location: body.location || "",
      caption: body.caption || "",
      order: body.order ?? currentCount,
      published: body.published ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection(COLLECTION).add(memoryData);

    return Response.json({ id: docRef.id, ...memoryData }, { status: 201 });
  } catch (error) {
    console.error("Error creating travel memory:", error);
    return Response.json({ error: "Failed to create travel memory" }, { status: 500 });
  }
}
