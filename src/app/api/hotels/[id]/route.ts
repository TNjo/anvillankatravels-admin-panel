import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";

const COLLECTION = "hotels";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return Response.json({ error: "Hotel not found" }, { status: 404 });
    }

    return Response.json(
      { id: doc.id, ...doc.data() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching hotel:", error);
    return Response.json({ error: "Failed to fetch hotel" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "hotels");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection(COLLECTION).doc(id).update(updateData);

    invalidateCache("hotels:");

    return Response.json({ id, ...updateData });
  } catch (error) {
    console.error("Error updating hotel:", error);
    return Response.json({ error: "Failed to update hotel" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "hotels");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { id } = await params;
    await adminDb.collection(COLLECTION).doc(id).delete();

    invalidateCache("hotels:");

    return Response.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return Response.json({ error: "Failed to delete hotel" }, { status: 500 });
  }
}
