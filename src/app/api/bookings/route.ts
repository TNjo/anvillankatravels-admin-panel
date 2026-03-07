import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import type { Booking } from "@/types";

const COLLECTION = "bookings";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const snapshot = await adminDb.collection(COLLECTION).get();
    let bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];

    if (status) {
      bookings = bookings.filter((b) => b.status === status);
    }

    bookings.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return Response.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const bookingData: Omit<Booking, "id"> = {
      ...body,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection(COLLECTION).add(bookingData);

    return Response.json({ id: docRef.id, ...bookingData }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return Response.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
