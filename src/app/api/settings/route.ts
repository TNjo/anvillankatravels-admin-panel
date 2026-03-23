import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

const DOC_PATH = "config/siteSettings";

export async function GET(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "settings");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const doc = await adminDb.doc(DOC_PATH).get();
    if (!doc.exists) {
      return Response.json({});
    }
    return Response.json(doc.data());
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "settings");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const body = await request.json();
    await adminDb.doc(DOC_PATH).set(body, { merge: true });
    return Response.json(body);
  } catch (error) {
    console.error("Error updating settings:", error);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
