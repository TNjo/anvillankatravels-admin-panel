import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const available = searchParams.get("available");

    let q = query(collection(db, "vehicles"), orderBy("createdAt", "desc"));

    if (status) {
      q = query(
        collection(db, "vehicles"),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    }

    if (available === "true") {
      q = query(
        collection(db, "vehicles"),
        where("status", "==", "available"),
        orderBy("createdAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
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
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const docRef = await addDoc(collection(db, "vehicles"), vehicleData);

    return NextResponse.json({ id: docRef.id, ...vehicleData }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
