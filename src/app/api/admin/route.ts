import { NextRequest } from "next/server";
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin";
import { adminDb } from "@/lib/firebase-admin";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import type { AdminModule, AdminRecord } from "@/types";
import { ALL_ADMIN_MODULES } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.email) return unauthorizedResponse();
    if (!isSuperAdmin(user.email)) return forbiddenResponse();

    const snapshot = await adminDb.collection("admins").orderBy("createdAt", "desc").get();
    const admins: AdminRecord[] = snapshot.docs.map((doc) => doc.data() as AdminRecord);

    return Response.json(admins);
  } catch (error) {
    console.error("Error listing admins:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.email) return unauthorizedResponse();
    if (!isSuperAdmin(user.email)) return forbiddenResponse();

    const body = await request.json();
    const { email, name, permissions } = body;

    if (!email || !name) {
      return Response.json({ error: "Email and name are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (SUPER_ADMIN_EMAILS.some((e) => normalizedEmail === e.toLowerCase())) {
      return Response.json({ error: "Cannot create admin record for super admin" }, { status: 400 });
    }

    // Validate permissions
    const validPermissions = (permissions || []).filter((p: string) =>
      ALL_ADMIN_MODULES.includes(p as AdminModule)
    );

    const now = new Date().toISOString();
    const adminRecord: AdminRecord = {
      email: normalizedEmail,
      name: name.trim(),
      permissions: validPermissions,
      createdAt: now,
      updatedAt: now,
      createdBy: user.email,
    };

    await adminDb.collection("admins").doc(normalizedEmail).set(adminRecord);

    return Response.json(adminRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating admin:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
