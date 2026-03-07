import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";

const COLLECTION = "dayTours";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return Response.json({ error: "Day tour not found" }, { status: 404 });
    }

    return Response.json({ id: doc.id, ...doc.data() }, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching day tour:", error);
    return Response.json({ error: "Failed to fetch day tour" }, { status: 500 });
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

    invalidateCache("dayTours:");

    return Response.json({ id, ...updateData });
  } catch (error) {
    console.error("Error updating day tour:", error);
    return Response.json({ error: "Failed to update day tour" }, { status: 500 });
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

    invalidateCache("dayTours:");

    return Response.json({ message: "Day tour deleted successfully" });
  } catch (error) {
    console.error("Error deleting day tour:", error);
    return Response.json({ error: "Failed to delete day tour" }, { status: 500 });
  }
}
