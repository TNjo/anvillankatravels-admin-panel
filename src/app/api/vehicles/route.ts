import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

const COLLECTION = "vehicles";

export async function GET(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "vehicles");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const available = searchParams.get("available");

    let query: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION)
      .orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (available === "true") {
      query = query.where("status", "==", "available");
    }

    const snapshot = await query.get();
    const vehicles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "vehicles");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const data = await request.json();
    const now = new Date().toISOString();

    const vehicleData = {
      registrationNumber: data.registrationNumber,
      type: data.type || "car",
      brand: data.brand,
      model: data.model,
      year: data.year || null,
      capacity: data.capacity || 4,
      color: data.color || null,
      features: data.features || [],
      imageUrl: data.imageUrl || null,
      status: data.status || "available",
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection(COLLECTION).add(vehicleData);

    return NextResponse.json({ id: docRef.id, ...vehicleData }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
