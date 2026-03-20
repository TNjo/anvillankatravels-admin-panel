import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";

const COLLECTION = "travelMemories";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return Response.json({ error: "Travel memory not found" }, { status: 404 });
    }

    return Response.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching travel memory:", error);
    return Response.json({ error: "Failed to fetch travel memory" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection(COLLECTION).doc(id).update(updateData);

    return Response.json({ id, ...updateData });
  } catch (error) {
    console.error("Error updating travel memory:", error);
    return Response.json({ error: "Failed to update travel memory" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    await adminDb.collection(COLLECTION).doc(id).delete();
    return Response.json({ message: "Travel memory deleted successfully" });
  } catch (error) {
    console.error("Error deleting travel memory:", error);
    return Response.json({ error: "Failed to delete travel memory" }, { status: 500 });
  }
}
