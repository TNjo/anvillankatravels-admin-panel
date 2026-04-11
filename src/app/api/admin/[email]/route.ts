import { NextRequest } from "next/server";
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin";
import { adminDb } from "@/lib/firebase-admin";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import type { AdminModule } from "@/types";
import { ALL_ADMIN_MODULES } from "@/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.email) return unauthorizedResponse();
    if (!isSuperAdmin(user.email)) return forbiddenResponse();

    const { email } = await params;
    const normalizedEmail = decodeURIComponent(email).toLowerCase().trim();

    if (SUPER_ADMIN_EMAILS.some((e) => normalizedEmail === e.toLowerCase())) {
      return Response.json({ error: "Cannot modify super admin" }, { status: 400 });
    }

    const docRef = adminDb.collection("admins").doc(normalizedEmail);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ error: "Admin not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, permissions } = body;

    const validPermissions = (permissions || []).filter((p: string) =>
      ALL_ADMIN_MODULES.includes(p as AdminModule)
    );

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (permissions !== undefined) updates.permissions = validPermissions;

    await docRef.update(updates);

    const updated = await docRef.get();
    return Response.json(updated.data());
  } catch (error) {
    console.error("Error updating admin:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.email) return unauthorizedResponse();
    if (!isSuperAdmin(user.email)) return forbiddenResponse();

    const { email } = await params;
    const normalizedEmail = decodeURIComponent(email).toLowerCase().trim();

    if (SUPER_ADMIN_EMAILS.some((e) => normalizedEmail === e.toLowerCase())) {
      return Response.json({ error: "Cannot delete super admin" }, { status: 400 });
    }

    const docRef = adminDb.collection("admins").doc(normalizedEmail);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ error: "Admin not found" }, { status: 404 });
    }

    await docRef.delete();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
