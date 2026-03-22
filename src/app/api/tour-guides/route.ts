import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth } from "@/lib/auth";

const COLLECTION = "tourGuides";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult || !authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const guides = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(guides);
  } catch (error) {
    console.error("Error fetching tour guides:", error);
    return NextResponse.json(
      { error: "Failed to fetch tour guides" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult || !authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const now = new Date().toISOString();

    const guideData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      languages: data.languages || ["English"],
      specializations: data.specializations || [],
      experience: data.experience || null,
      bio: data.bio || null,
      imageUrl: data.imageUrl || null,
      licenseNumber: data.licenseNumber || null,
      status: data.status || "available",
      rating: data.rating || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection(COLLECTION).add(guideData);

    return NextResponse.json({ id: docRef.id, ...guideData }, { status: 201 });
  } catch (error) {
    console.error("Error creating tour guide:", error);
    return NextResponse.json(
      { error: "Failed to create tour guide" },
      { status: 500 }
    );
  }
}
