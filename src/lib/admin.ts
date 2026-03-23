import { adminDb } from "./firebase-admin";
import { SUPER_ADMIN_EMAILS } from "./constants";
import type { AdminModule, AdminRecord } from "@/types";

export function isSuperAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.some(
    (superEmail) => email.toLowerCase() === superEmail.toLowerCase()
  );
}

export async function getAdminRecord(email: string): Promise<AdminRecord | null> {
  const doc = await adminDb.collection("admins").doc(email.toLowerCase()).get();
  if (!doc.exists) return null;
  return doc.data() as AdminRecord;
}

export async function hasPermission(
  email: string | undefined,
  module: AdminModule
): Promise<boolean> {
  if (!email) return false;
  if (isSuperAdmin(email)) return true;
  const record = await getAdminRecord(email);
  if (!record) return false;
  return record.permissions.includes(module);
}

export async function hasAnyPermission(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  if (isSuperAdmin(email)) return true;
  const record = await getAdminRecord(email);
  if (!record) return false;
  return record.permissions.length > 0;
}
