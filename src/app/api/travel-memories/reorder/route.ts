import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";

const COLLECTION = "travelMemories";

export async function PUT(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { items } = body as { items: { id: string; order: number }[] };

    if (!items || !Array.isArray(items)) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const batch = adminDb.batch();
    const now = new Date().toISOString();

    for (const item of items) {
      const docRef = adminDb.collection(COLLECTION).doc(item.id);
      batch.update(docRef, { order: item.order, updatedAt: now });
    }

    await batch.commit();

    return Response.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error("Error reordering travel memories:", error);
    return Response.json({ error: "Failed to reorder travel memories" }, { status: 500 });
  }
}
