import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";
import { applyTranslations } from "@/lib/translate";

const COLLECTION = "dayTours";
const TRANSLATIONS_COLLECTION = "translations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang");

    const doc = await adminDb.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return Response.json({ error: "Day tour not found" }, { status: 404 });
    }

    let tourData: Record<string, unknown> = { id: doc.id, ...doc.data() };

    if (lang && lang !== "en") {
      const transDoc = await adminDb
        .collection(TRANSLATIONS_COLLECTION)
        .doc(`${COLLECTION}_${id}_${lang}`)
        .get();

      if (transDoc.exists) {
        const transData = transDoc.data();
        if (transData?.fields) {
          tourData = applyTranslations(tourData, transData.fields);
        }
      }
    }

    return Response.json(tourData, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching day tour:", error);
    return Response.json({ error: "Failed to fetch day tour" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "day-tours");
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

    invalidateCache("dayTours:");

    return Response.json({ id, ...updateData });
  } catch (error) {
    console.error("Error updating day tour:", error);
    return Response.json({ error: "Failed to update day tour" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, authorized } = await verifyAdminPermission(request, "day-tours");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { id } = await params;
    await adminDb.collection(COLLECTION).doc(id).delete();

    invalidateCache("dayTours:");

    return Response.json({ message: "Day tour deleted successfully" });
  } catch (error) {
    console.error("Error deleting day tour:", error);
    return Response.json({ error: "Failed to delete day tour" }, { status: 500 });
  }
}
