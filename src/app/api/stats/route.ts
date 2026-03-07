import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return unauthorizedResponse();

  try {
    const [tours, dayTours, bookings, contacts] = await Promise.all([
      adminDb.collection("tours").count().get(),
      adminDb.collection("dayTours").count().get(),
      adminDb.collection("bookings").count().get(),
      adminDb.collection("contacts").where("status", "==", "unread").count().get(),
    ]);

    const pendingBookings = await adminDb
      .collection("bookings")
      .where("status", "==", "pending")
      .count()
      .get();

    return Response.json({
      totalTours: tours.data().count,
      totalDayTours: dayTours.data().count,
      totalBookings: bookings.data().count,
      unreadContacts: contacts.data().count,
      pendingBookings: pendingBookings.data().count,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
