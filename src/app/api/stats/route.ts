import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAnyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { getCached, setCache } from "@/lib/cache";

interface StatsData {
  totalTours: number;
  totalDayTours: number;
  totalBookings: number;
  unreadContacts: number;
  pendingBookings: number;
}

export async function GET(request: NextRequest) {
  const { user, authorized } = await verifyAnyAdminPermission(request);
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const cached = getCached<StatsData>("stats");
    if (cached) {
      return Response.json(cached);
    }

    const [tours, dayTours, bookings, contacts, pendingBookings] =
      await Promise.all([
        adminDb.collection("tours").count().get(),
        adminDb.collection("dayTours").count().get(),
        adminDb.collection("bookings").count().get(),
        adminDb.collection("contacts").where("status", "==", "unread").count().get(),
        adminDb.collection("bookings").where("status", "==", "pending").count().get(),
      ]);

    const stats: StatsData = {
      totalTours: tours.data().count,
      totalDayTours: dayTours.data().count,
      totalBookings: bookings.data().count,
      unreadContacts: contacts.data().count,
      pendingBookings: pendingBookings.data().count,
    };

    setCache("stats", stats, 30);

    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
