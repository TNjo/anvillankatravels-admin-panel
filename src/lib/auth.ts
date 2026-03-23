import { adminAuth } from "./firebase-admin";
import { NextRequest } from "next/server";
import { hasPermission, hasAnyPermission } from "./admin";
import type { AdminModule } from "@/types";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function verifyAuth(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}

export async function verifyAdminPermission(
  request: NextRequest,
  module: AdminModule
): Promise<{ user: DecodedIdToken | null; authorized: boolean }> {
  const user = await verifyAuth(request);
  if (!user) return { user: null, authorized: false };
  const authorized = await hasPermission(user.email, module);
  return { user, authorized };
}

export async function verifyAnyAdminPermission(
  request: NextRequest
): Promise<{ user: DecodedIdToken | null; authorized: boolean }> {
  const user = await verifyAuth(request);
  if (!user) return { user: null, authorized: false };
  const authorized = await hasAnyPermission(user.email);
  return { user, authorized };
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
