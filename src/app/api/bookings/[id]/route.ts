import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

const COLLECTION = "bookings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "bookings");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return Response.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "bookings");
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

    return Response.json({ id, ...updateData });
  } catch (error) {
    console.error("Error updating booking:", error);
    return Response.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "bookings");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { id } = await params;
    await adminDb.collection(COLLECTION).doc(id).delete();
    return Response.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return Response.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
