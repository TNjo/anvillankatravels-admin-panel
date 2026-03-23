import { NextRequest } from "next/server";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { isSuperAdmin, getAdminRecord } from "@/lib/admin";
import { ALL_ADMIN_MODULES } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.email) return unauthorizedResponse();

    const email = user.email.toLowerCase();

    if (isSuperAdmin(email)) {
      return Response.json({
        isSuperAdmin: true,
        permissions: ALL_ADMIN_MODULES,
      });
    }

    const record = await getAdminRecord(email);
    if (record) {
      return Response.json({
        isSuperAdmin: false,
        permissions: record.permissions,
      });
    }

    return Response.json({
      isSuperAdmin: false,
      permissions: [],
    });
  } catch (error) {
    console.error("Error fetching admin role:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
