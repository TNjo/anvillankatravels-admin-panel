import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "bookings");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email service not configured. Please add RESEND_API_KEY to environment variables." },
        { status: 500 }
      );
    }

    const { bookingId, customNotes } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const bookingDoc = await adminDb.collection("bookings").doc(bookingId).get();
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const booking = { id: bookingDoc.id, ...bookingDoc.data() } as {
      id: string;
      tourId: string;
      tourName: string;
      tourType: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      customerCountry?: string;
      numberOfAdults: number;
      numberOfChildren?: number;
      childrenAges?: string;
      preferredDate: string;
      endDate?: string;
      pickupLocation?: string;
      dropoffLocation?: string;
      accommodationType?: string;
      specialRequests?: string;
      vehicleInfo?: { registrationNumber: string; type: string; brand: string; model: string };
      guideInfo?: { name: string; phone: string; languages: string[] };
      itineraryNotes?: string;
    };

    interface ItineraryDay {
      day: number;
      title: string;
      description: string;
      location: string;
      activities: string[];
      accommodation?: string;
    }

    interface TourInfo { name: string; highlights?: string[]; route?: string[]; itinerary?: ItineraryDay[]; duration?: { days: number; nights: number } }
    let tour: TourInfo | null = null;
    if (booking.tourId) {
      const tourDoc = await adminDb.collection("tours").doc(booking.tourId).get();
      if (tourDoc.exists) {
        tour = tourDoc.data() as TourInfo;
      }
    }

    // Generate PDF via internal API call
    const generateUrl = new URL("/api/itinerary/generate", request.url);
    const token = request.headers.get("Authorization");
    const pdfResponse = await fetch(generateUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({ bookingId, customNotes }),
    });

    if (!pdfResponse.ok) {
      const err = await pdfResponse.json().catch(() => ({ error: "PDF generation failed" }));
      return NextResponse.json({ error: err.error || "Failed to generate PDF" }, { status: 500 });
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    const filename = `Itinerary-${booking.customerName.replace(/\s+/g, "_")}-${booking.id.substring(0, 8)}.pdf`;

    // Build itinerary summary for the email body
    const itineraryDaysHtml = tour?.itinerary
      ?.map(
        (day) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
            <span style="display: inline-block; background: #0891b2; color: white; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: bold;">
              DAY ${day.day}
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #111827;">${day.title}</strong>
            ${day.location ? `<br><span style="color: #6b7280; font-size: 12px;">📍 ${day.location}</span>` : ""}
            ${day.accommodation ? `<br><span style="color: #059669; font-size: 12px;">🏨 ${day.accommodation}</span>` : ""}
          </td>
        </tr>`
      )
      .join("") || "";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Travel Itinerary - ${booking.tourName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Anvil Lanka Travels</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your Journey, Our Passion</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="color: #374151; font-size: 16px; margin-bottom: 5px;">
        Dear ${booking.customerName},
      </p>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        We are thrilled to share your travel itinerary for your upcoming trip to Sri Lanka! 
        Please find your detailed itinerary attached as a PDF document.
      </p>

      <!-- Trip Summary Box -->
      <div style="background: #ecfeff; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0e7490; margin: 0 0 8px 0; font-size: 16px;">${booking.tourName}</h3>
        <p style="color: #6b7280; margin: 0; font-size: 13px;">
          ${booking.tourType === "multi-day" ? "Multi-Day Tour" : booking.tourType === "day-tour" ? "Day Tour" : "Custom Tour"}
          ${tour?.duration ? ` • ${tour.duration.days} Days / ${tour.duration.nights} Nights` : ""}
        </p>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 13px;">
          📅 ${new Date(booking.preferredDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          ${booking.endDate ? ` — ${new Date(booking.endDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}` : ""}
        </p>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 13px;">
          👥 ${booking.numberOfAdults} Adult${booking.numberOfAdults !== 1 ? "s" : ""}${booking.numberOfChildren ? `, ${booking.numberOfChildren} Child${booking.numberOfChildren !== 1 ? "ren" : ""}` : ""}
        </p>
      </div>

      ${itineraryDaysHtml ? `
      <!-- Itinerary Overview -->
      <h3 style="color: #111827; font-size: 16px; margin: 25px 0 10px 0;">Itinerary Overview</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itineraryDaysHtml}
        </tbody>
      </table>
      ` : ""}

      ${booking.vehicleInfo || booking.guideInfo ? `
      <!-- Trip Team -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 14px;">Your Trip Team</h4>
        ${booking.vehicleInfo ? `
        <p style="color: #6b7280; margin: 5px 0; font-size: 13px;">
          🚗 <strong>${booking.vehicleInfo.brand} ${booking.vehicleInfo.model}</strong> (${booking.vehicleInfo.registrationNumber})
        </p>` : ""}
        ${booking.guideInfo ? `
        <p style="color: #6b7280; margin: 5px 0; font-size: 13px;">
          👤 <strong>${booking.guideInfo.name}</strong> — ${booking.guideInfo.phone}
          ${booking.guideInfo.languages ? `<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Languages: ${booking.guideInfo.languages.join(", ")}` : ""}
        </p>` : ""}
      </div>
      ` : ""}

      ${customNotes || booking.itineraryNotes ? `
      <div style="background: #fffbeb; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Important Notes</h4>
        <p style="color: #78350f; font-size: 13px; margin: 0; line-height: 1.5;">${customNotes || booking.itineraryNotes}</p>
      </div>
      ` : ""}

      <div style="background: #f0fdf4; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
        <p style="color: #166534; margin: 0; font-size: 14px;">
          📎 <strong>Your full detailed itinerary is attached as a PDF document.</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          We look forward to making your Sri Lanka experience unforgettable!
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
          Questions? Contact us at info@anvillankatravels.com
        </p>
      </div>
    </div>

    <!-- Email Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        Anvil Lanka Travels | Colombo, Sri Lanka
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Anvil Lanka Travels <noreply@anvillankatravels.com>";

    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: [booking.customerEmail],
      subject: `Your Travel Itinerary - ${booking.tourName} | Anvil Lanka Travels`,
      html: emailHtml,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (error) {
      console.error("Resend API error:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Email failed: ${error.message}`, details: error.name },
        { status: 500 }
      );
    }

    // Update booking to track itinerary was sent
    await adminDb.collection("bookings").doc(bookingId).update({
      itinerarySent: true,
      itinerarySentAt: new Date().toISOString(),
      ...(customNotes ? { itineraryNotes: customNotes } : {}),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: `Itinerary sent successfully to ${booking.customerEmail}`,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error sending itinerary:", errMsg);
    return NextResponse.json(
      { error: `Failed to send itinerary: ${errMsg}` },
      { status: 500 }
    );
  }
}
