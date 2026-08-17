import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";

const COLLECTION = "locations";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by ID first
    let doc = await adminDb.collection(COLLECTION).doc(id).get();
    
    // If not found by ID, try to find by slug
    if (!doc.exists) {
      const snapshot = await adminDb
        .collection(COLLECTION)
        .where("slug", "==", id)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        doc = snapshot.docs[0];
      }
    }

    if (!doc.exists) {
      return Response.json({ error: "Location not found" }, { status: 404 });
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
    console.error("Error fetching location:", error);
    return Response.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "locations");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = {
      ...body,
      slug: generateSlug(body.name),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection(COLLECTION).doc(id).update(updateData);

    invalidateCache("locations:");

    return Response.json({ id, ...updateData });
  } catch (error) {
    console.error("Error updating location:", error);
    return Response.json({ error: "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "locations");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { id } = await params;
    await adminDb.collection(COLLECTION).doc(id).delete();

    invalidateCache("locations:");

    return Response.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    return Response.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
