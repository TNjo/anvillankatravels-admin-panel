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

    let query: FirebaseFirestore.Query = adminDb
      .collection(COLLECTION)
      .orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];

    return Response.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const isAdminRequest = authHeader?.startsWith("Bearer ");

  if (isAdminRequest) {
    const user = await verifyAuth(request);
    if (!user) return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const bookingData: Omit<Booking, "id"> = {
      tourId: body.tourId || "",
      tourType: body.tourType || "multi-day",
      tourName: body.tourName || "",
      customerName: body.customerName || "",
      customerEmail: body.customerEmail || "",
      customerPhone: body.customerPhone || "",
      customerCountry: body.customerCountry || "",
      numberOfAdults: body.numberOfAdults || body.numberOfGuests || 1,
      numberOfChildren: body.numberOfChildren || 0,
      childrenAges: body.childrenAges || "",
      preferredDate: body.preferredDate || "",
      endDate: body.endDate || "",
      pickupLocation: body.pickupLocation || "",
      dropoffLocation: body.dropoffLocation || "",
      accommodationType: body.accommodationType || "mid-range",
      totalPrice: body.totalPrice || 0,
      currency: body.currency || "USD",
      depositPaid: body.depositPaid || 0,
      paymentStatus: body.paymentStatus || "unpaid",
      specialRequests: body.specialRequests || "",
      internalNotes: body.internalNotes || "",
      status: body.status || "pending",
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
