import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";

const COLLECTION = "contacts";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();

    await adminDb.collection(COLLECTION).doc(id).update(body);

    return Response.json({ id, ...body });
  } catch (error) {
    console.error("Error updating contact:", error);
    return Response.json({ error: "Failed to update contact" }, { status: 500 });
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
    return Response.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return Response.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
