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
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const bookingDoc = await adminDb.collection("bookings").doc(bookingId).get();
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = { id: bookingDoc.id, ...bookingDoc.data() } as {
      id: string;
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
      totalPrice?: number;
      currency?: string;
      depositPaid?: number;
      paymentStatus?: string;
      specialRequests?: string;
      status: string;
    };

    if (!booking.customerEmail) {
      return NextResponse.json(
        { error: "Booking does not have a customer email" },
        { status: 400 }
      );
    }

    const tourTypeLabel =
      booking.tourType === "multi-day"
        ? "Multi-Day Tour"
        : booking.tourType === "day-tour"
        ? "Day Tour"
        : "Custom Tour";

    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const guestsText = `${booking.numberOfAdults} Adult${booking.numberOfAdults > 1 ? "s" : ""}${
      booking.numberOfChildren && booking.numberOfChildren > 0
        ? ` & ${booking.numberOfChildren} Child${booking.numberOfChildren > 1 ? "ren" : ""}${
            booking.childrenAges ? ` (Ages: ${booking.childrenAges})` : ""
          }`
        : ""
    }`;

    const accommodationLabel = booking.accommodationType
      ? booking.accommodationType
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "";

    const currency = booking.currency || "USD";
    const balanceDue = (booking.totalPrice || 0) - (booking.depositPaid || 0);

    // Build booking details rows
    let detailsRows = `
      <tr>
        <td style="padding: 10px 15px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6; width: 40%;">Guests</td>
        <td style="padding: 10px 15px; color: #111827; font-size: 14px; border-bottom: 1px solid #f3f4f6;">${guestsText}</td>
      </tr>
      <tr>
        <td style="padding: 10px 15px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6;">Tour Dates</td>
        <td style="padding: 10px 15px; color: #111827; font-size: 14px; border-bottom: 1px solid #f3f4f6;">
          ${formatDate(booking.preferredDate)}${booking.endDate ? ` — ${formatDate(booking.endDate)}` : ""}
        </td>
      </tr>`;

    if (booking.pickupLocation) {
      detailsRows += `
      <tr>
        <td style="padding: 10px 15px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6;">Pickup Location</td>
        <td style="padding: 10px 15px; color: #111827; font-size: 14px; border-bottom: 1px solid #f3f4f6;">${booking.pickupLocation}</td>
      </tr>`;
    }

    if (booking.dropoffLocation) {
      detailsRows += `
      <tr>
        <td style="padding: 10px 15px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6;">Drop-off Location</td>
        <td style="padding: 10px 15px; color: #111827; font-size: 14px; border-bottom: 1px solid #f3f4f6;">${booking.dropoffLocation}</td>
      </tr>`;
    }

    if (booking.accommodationType && booking.accommodationType !== "not-required") {
      detailsRows += `
      <tr>
        <td style="padding: 10px 15px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6;">Accommodation</td>
        <td style="padding: 10px 15px; color: #111827; font-size: 14px; border-bottom: 1px solid #f3f4f6;">${accommodationLabel}</td>
      </tr>`;
    }

    // Build payment section
    let paymentHtml = "";
    if (booking.totalPrice && booking.totalPrice > 0) {
      paymentHtml = `
      <div style="margin: 25px 0;">
        <h3 style="color: #374151; font-size: 16px; margin: 0 0 12px 0;">Payment Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 15px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6; width: 40%;">Total Amount</td>
            <td style="padding: 10px 15px; color: #111827; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${currency} ${booking.totalPrice.toLocaleString()}</td>
          </tr>
          ${booking.depositPaid && booking.depositPaid > 0 ? `
          <tr>
            <td style="padding: 10px 15px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f3f4f6;">Deposit Paid</td>
            <td style="padding: 10px 15px; color: #059669; font-size: 14px; border-bottom: 1px solid #f3f4f6;">${currency} ${booking.depositPaid.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; color: #6b7280; font-size: 14px; font-weight: 600;">Balance Due</td>
            <td style="padding: 10px 15px; color: ${balanceDue > 0 ? "#dc2626" : "#059669"}; font-size: 14px; font-weight: 600;">${currency} ${balanceDue.toLocaleString()}</td>
          </tr>
          ` : ""}
        </table>
      </div>`;
    }

    // Build special requests section
    let specialRequestsHtml = "";
    if (booking.specialRequests) {
      specialRequestsHtml = `
      <div style="margin: 20px 0;">
        <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Your Special Requests</h3>
        <div style="background: #f9fafb; border-radius: 8px; padding: 15px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">${booking.specialRequests}</p>
        </div>
      </div>`;
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${booking.tourName}</title>
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
      <!-- Confirmation Badge -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background: #ecfdf5; border-radius: 50px; padding: 10px 24px;">
          <span style="color: #059669; font-size: 16px; font-weight: 600;">&#10003; Booking Confirmed</span>
        </div>
      </div>

      <p style="color: #374151; font-size: 16px; margin-bottom: 5px;">
        Dear ${booking.customerName},
      </p>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Thank you for choosing Anvil Lanka Travels! We are pleased to confirm your booking. Below are your trip details.
      </p>

      <!-- Tour Info -->
      <div style="background: #ecfeff; border-left: 4px solid #0891b2; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0e7490; margin: 0 0 8px 0; font-size: 18px;">${booking.tourName}</h3>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">${tourTypeLabel}</p>
      </div>

      <!-- Booking Details -->
      <div style="margin: 25px 0;">
        <h3 style="color: #374151; font-size: 16px; margin: 0 0 12px 0;">Trip Details</h3>
        <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px;">
          ${detailsRows}
        </table>
      </div>

      ${paymentHtml}

      ${specialRequestsHtml}

      <!-- Closing -->
      <div style="background: #f0fdfa; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
        <p style="color: #0e7490; font-size: 16px; margin: 0; font-weight: 500;">
          We look forward to welcoming you to Sri Lanka!
        </p>
        <p style="color: #6b7280; font-size: 13px; margin: 8px 0 0 0;">
          Our team will be in touch with further details as your trip date approaches.
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Thank you for choosing Anvil Lanka Travels!
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

    const { data, error } = await getResend().emails.send({
      from: "Anvil Lanka Travels <noreply@anvillankatravels.com>",
      to: [booking.customerEmail],
      subject: `Booking Confirmation - ${booking.tourName} | Anvil Lanka Travels`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    }

    await adminDb.collection("bookings").doc(bookingId).update({
      confirmationEmailSent: true,
      confirmationEmailSentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: `Booking confirmation sent to ${booking.customerEmail}`,
    });
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return NextResponse.json(
      { error: "Failed to send booking confirmation email" },
      { status: 500 }
    );
  }
}
