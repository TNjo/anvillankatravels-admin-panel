import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "bookings");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const excludeBookingId = searchParams.get("excludeBookingId");

    if (!startDate) {
      return Response.json(
        { error: "startDate is required" },
        { status: 400 }
      );
    }

    const queryEndDate = endDate || startDate;

    // Fetch all active bookings (not cancelled)
    const snapshot = await adminDb
      .collection("bookings")
      .where("status", "!=", "cancelled")
      .get();

    const bookedVehicleIds: Set<string> = new Set();
    const bookedGuideIds: Set<string> = new Set();
    const conflicts: Array<{
      bookingId: string;
      customerName: string;
      tourName: string;
      startDate: string;
      endDate: string;
      vehicleId?: string;
      guideId?: string;
    }> = [];

    for (const doc of snapshot.docs) {
      if (excludeBookingId && doc.id === excludeBookingId) continue;

      const booking = doc.data();
      const bStart = booking.preferredDate || "";
      const bEnd = booking.endDate || booking.preferredDate || "";

      if (!bStart) continue;

      // Check date overlap: bookingEnd >= requestedStart AND requestedEnd >= bookingStart
      const overlaps = bEnd >= startDate && queryEndDate >= bStart;

      if (overlaps) {
        if (booking.vehicleId) {
          bookedVehicleIds.add(booking.vehicleId);
        }
        if (booking.guideId) {
          bookedGuideIds.add(booking.guideId);
        }
        if (booking.vehicleId || booking.guideId) {
          conflicts.push({
            bookingId: doc.id,
            customerName: booking.customerName || "",
            tourName: booking.tourName || "",
            startDate: bStart,
            endDate: bEnd,
            vehicleId: booking.vehicleId,
            guideId: booking.guideId,
          });
        }
      }
    }

    return Response.json({
      bookedVehicleIds: Array.from(bookedVehicleIds),
      bookedGuideIds: Array.from(bookedGuideIds),
      conflicts,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return Response.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
