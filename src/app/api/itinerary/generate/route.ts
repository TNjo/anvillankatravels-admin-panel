import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPermission, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

interface TourDay {
  day: number;
  title: string;
  description: string;
  location: string;
  activities: string[];
  accommodation?: string;
}

interface TourData {
  id: string;
  name: string;
  duration?: { days: number; nights: number };
  summary?: string;
  route?: string[];
  highlights?: string[];
  itinerary?: TourDay[];
}

interface BookingData {
  id: string;
  tourId: string;
  tourType: string;
  tourName: string;
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
  specialRequests?: string;
  vehicleId?: string;
  vehicleInfo?: {
    registrationNumber: string;
    type: string;
    brand: string;
    model: string;
  };
  guideId?: string;
  guideInfo?: {
    name: string;
    phone: string;
    languages: string[];
  };
  itineraryNotes?: string;
}

const COLORS = {
  primary: "#0891b2" as const,
  primaryDark: "#0e7490" as const,
  dark: "#111827" as const,
  text: "#374151" as const,
  muted: "#6b7280" as const,
  light: "#f3f4f6" as const,
  white: "#ffffff" as const,
  accent: "#ecfeff" as const,
  border: "#e5e7eb" as const,
  green: "#059669" as const,
  orange: "#d97706" as const,
};

function formatDateStr(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function loadLogo(): Buffer | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath);
    }
  } catch {
    // Logo not available
  }
  return null;
}

function generateItineraryPDF(booking: BookingData, tour: TourData | null, customNotes?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
      info: {
        Title: `Travel Itinerary - ${booking.tourName}`,
        Author: "Anvil Lanka Travels",
        Subject: `Itinerary for ${booking.customerName}`,
      },
    });

    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100;
    const logo = loadLogo();

    // ─── COVER PAGE ───
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.primary);

    doc.rect(0, 0, doc.page.width, 8).fill(COLORS.primaryDark);
    doc.rect(0, doc.page.height - 8, doc.page.width, 8).fill(COLORS.primaryDark);

    if (logo) {
      doc.image(logo, doc.page.width / 2 - 40, 120, { width: 80, height: 80 });
    }

    const logoBottomY = logo ? 220 : 160;

    doc
      .font("Helvetica-Bold")
      .fontSize(32)
      .fillColor(COLORS.white)
      .text("ANVIL LANKA TRAVELS", 50, logoBottomY, { align: "center", width: pageWidth });

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("rgba(255,255,255,0.8)")
      .text("Your Journey, Our Passion", 50, logoBottomY + 45, { align: "center", width: pageWidth });

    doc
      .moveTo(doc.page.width / 2 - 60, logoBottomY + 80)
      .lineTo(doc.page.width / 2 + 60, logoBottomY + 80)
      .lineWidth(2)
      .strokeColor(COLORS.white)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("rgba(255,255,255,0.9)")
      .text("TRAVEL ITINERARY", 50, logoBottomY + 100, { align: "center", width: pageWidth });

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor(COLORS.white)
      .text(booking.tourName, 50, logoBottomY + 150, { align: "center", width: pageWidth });

    const infoStartY = logoBottomY + 220;

    doc.roundedRect(100, infoStartY, doc.page.width - 200, 160, 10).fill("rgba(255,255,255,0.15)");

    const infoItems = [
      { label: "Guest", value: booking.customerName },
      { label: "Dates", value: `${formatDateStr(booking.preferredDate)}${booking.endDate ? ` — ${formatDateStr(booking.endDate)}` : ""}` },
      { label: "Guests", value: `${booking.numberOfAdults} Adult${booking.numberOfAdults !== 1 ? "s" : ""}${booking.numberOfChildren ? `, ${booking.numberOfChildren} Child${booking.numberOfChildren !== 1 ? "ren" : ""}` : ""}` },
      { label: "Ref", value: booking.id.substring(0, 8).toUpperCase() },
    ];

    let infoY = infoStartY + 20;
    infoItems.forEach((item) => {
      doc.font("Helvetica").fontSize(10).fillColor("rgba(255,255,255,0.7)").text(item.label, 130, infoY);
      doc.font("Helvetica-Bold").fontSize(13).fillColor(COLORS.white).text(item.value, 130, infoY + 14, { width: doc.page.width - 280 });
      infoY += 38;
    });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("rgba(255,255,255,0.6)")
      .text("www.anvillankatravels.com", 50, doc.page.height - 80, { align: "center", width: pageWidth });

    // ─── TRIP OVERVIEW PAGE ───
    doc.addPage();

    function drawPageHeader(title: string) {
      const y = 50;
      doc.font("Helvetica-Bold").fontSize(20).fillColor(COLORS.primary).text(title, 50, y);
      doc.moveTo(50, y + 28).lineTo(50 + pageWidth, y + 28).lineWidth(2).strokeColor(COLORS.primary).stroke();
      return y + 45;
    }

    function drawSectionBox(y: number, height: number) {
      doc.roundedRect(50, y, pageWidth, height, 6).fill(COLORS.light);
      return y;
    }

    let y = drawPageHeader("Trip Overview");

    // Trip details grid
    const details = [
      { label: "Tour", value: booking.tourName },
      { label: "Tour Type", value: booking.tourType === "multi-day" ? "Multi-Day Tour" : booking.tourType === "day-tour" ? "Day Tour" : "Custom Package" },
      { label: "Start Date", value: formatDateStr(booking.preferredDate) },
      ...(booking.endDate ? [{ label: "End Date", value: formatDateStr(booking.endDate) }] : []),
      { label: "Adults", value: String(booking.numberOfAdults) },
      ...(booking.numberOfChildren ? [{ label: "Children", value: `${booking.numberOfChildren}${booking.childrenAges ? ` (Ages: ${booking.childrenAges})` : ""}` }] : []),
      ...(booking.pickupLocation ? [{ label: "Pickup", value: booking.pickupLocation }] : []),
      ...(booking.dropoffLocation ? [{ label: "Drop-off", value: booking.dropoffLocation }] : []),
      ...(booking.accommodationType ? [{ label: "Accommodation", value: booking.accommodationType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") }] : []),
    ];

    const boxHeight = Math.ceil(details.length / 2) * 36 + 20;
    drawSectionBox(y, boxHeight);

    const colWidth = (pageWidth - 30) / 2;
    details.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const itemX = 65 + col * colWidth;
      const itemY = y + 15 + row * 36;

      doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text(item.label.toUpperCase(), itemX, itemY);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.dark).text(item.value, itemX, itemY + 13, { width: colWidth - 20 });
    });

    y += boxHeight + 20;

    // Highlights
    if (tour?.highlights && tour.highlights.length > 0) {
      doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.primaryDark).text("Highlights", 50, y);
      y += 22;

      tour.highlights.forEach((highlight) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
        }
        doc.font("Helvetica").fontSize(10).fillColor(COLORS.primary).text("●", 60, y);
        doc.font("Helvetica").fontSize(10).fillColor(COLORS.text).text(highlight, 78, y, { width: pageWidth - 40 });
        y += 18;
      });

      y += 15;
    }

    // Route
    if (tour?.route && tour.route.length > 0) {
      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 50;
      }
      doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.primaryDark).text("Route", 50, y);
      y += 22;

      const routeText = tour.route.join("  →  ");
      doc.font("Helvetica").fontSize(10).fillColor(COLORS.text).text(routeText, 60, y, { width: pageWidth - 20 });
      y += doc.heightOfString(routeText, { width: pageWidth - 20 }) + 20;
    }

    // Vehicle & Guide info
    if (booking.vehicleInfo || booking.guideInfo) {
      if (y > doc.page.height - 160) {
        doc.addPage();
        y = 50;
      }

      doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.primaryDark).text("Your Trip Team", 50, y);
      y += 22;

      const teamBoxHeight = (booking.vehicleInfo && booking.guideInfo) ? 80 : 55;
      doc.roundedRect(50, y, pageWidth, teamBoxHeight, 6).lineWidth(1).strokeColor(COLORS.primary).fillAndStroke(COLORS.accent, COLORS.primary);

      let teamY = y + 12;

      if (booking.vehicleInfo) {
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text("VEHICLE", 65, teamY);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.dark)
          .text(`${booking.vehicleInfo.brand} ${booking.vehicleInfo.model} (${booking.vehicleInfo.type.toUpperCase()})`, 65, teamY + 13);
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
          .text(`Reg: ${booking.vehicleInfo.registrationNumber}`, 65, teamY + 28);
        teamY += 45;
      }

      if (booking.guideInfo) {
        const guideX = booking.vehicleInfo ? 65 + pageWidth / 2 - 15 : 65;
        const guideY = booking.vehicleInfo ? y + 12 : teamY;

        doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text("TOUR GUIDE", guideX, guideY);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.dark)
          .text(booking.guideInfo.name, guideX, guideY + 13);
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
          .text(`${booking.guideInfo.phone} • ${booking.guideInfo.languages?.join(", ") || ""}`, guideX, guideY + 28, { width: pageWidth / 2 - 30 });
      }

      y += teamBoxHeight + 20;
    }

    // ─── DAY-BY-DAY ITINERARY ───
    if (tour?.itinerary && tour.itinerary.length > 0) {
      doc.addPage();
      y = drawPageHeader("Day-by-Day Itinerary");

      tour.itinerary.forEach((day, index) => {
        const dayContentHeight = 60
          + (day.description ? doc.heightOfString(day.description, { width: pageWidth - 60 }) : 0)
          + (day.activities?.length || 0) * 16
          + (day.accommodation ? 30 : 0)
          + 30;

        if (y + dayContentHeight > doc.page.height - 60) {
          doc.addPage();
          y = 50;
        }

        // Day number badge
        doc.roundedRect(50, y, 50, 26, 4).fill(COLORS.primary);
        doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.white).text(`DAY ${day.day || index + 1}`, 52, y + 7, { width: 46, align: "center" });

        // Day title
        doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.dark).text(day.title, 110, y + 4, { width: pageWidth - 70 });
        y += 32;

        // Location
        if (day.location) {
          doc.font("Helvetica").fontSize(9).fillColor(COLORS.primary).text(`📍 ${day.location}`, 60, y);
          y += 16;
        }

        // Description
        if (day.description) {
          doc.font("Helvetica").fontSize(10).fillColor(COLORS.text).text(day.description, 60, y, { width: pageWidth - 20 });
          y += doc.heightOfString(day.description, { width: pageWidth - 20 }) + 10;
        }

        // Activities
        if (day.activities && day.activities.length > 0) {
          doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.muted).text("ACTIVITIES", 60, y);
          y += 14;

          day.activities.forEach((activity) => {
            doc.font("Helvetica").fontSize(9).fillColor(COLORS.green).text("▸", 66, y);
            doc.font("Helvetica").fontSize(9).fillColor(COLORS.text).text(activity, 78, y, { width: pageWidth - 40 });
            y += 14;
          });
          y += 6;
        }

        // Accommodation
        if (day.accommodation) {
          doc.roundedRect(60, y, pageWidth - 20, 24, 4).fill("#f0fdf4");
          doc.font("Helvetica").fontSize(9).fillColor(COLORS.green).text(`🏨  ${day.accommodation}`, 70, y + 7, { width: pageWidth - 40 });
          y += 34;
        }

        // Separator
        if (index < tour.itinerary!.length - 1) {
          doc.moveTo(80, y).lineTo(pageWidth + 20, y).lineWidth(0.5).strokeColor(COLORS.border).stroke();
          y += 16;
        }
      });
    }

    // ─── SPECIAL NOTES / CUSTOM MESSAGE ───
    if (customNotes || booking.specialRequests || booking.itineraryNotes) {
      if (y > doc.page.height - 150) {
        doc.addPage();
        y = 50;
      } else {
        y += 20;
      }

      doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.primaryDark).text("Important Information", 50, y);
      y += 22;

      const notes = customNotes || booking.itineraryNotes || booking.specialRequests || "";
      if (notes) {
        doc.roundedRect(50, y, pageWidth, doc.heightOfString(notes, { width: pageWidth - 30 }) + 20, 6)
          .fill("#fffbeb");
        doc.font("Helvetica").fontSize(10).fillColor(COLORS.text).text(notes, 65, y + 10, { width: pageWidth - 30 });
        y += doc.heightOfString(notes, { width: pageWidth - 30 }) + 35;
      }
    }

    // ─── FOOTER ON EVERY PAGE ───
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      // Footer line
      doc.moveTo(50, doc.page.height - 45).lineTo(50 + pageWidth, doc.page.height - 45).lineWidth(0.5).strokeColor(COLORS.border).stroke();

      // Footer text
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(
          "Anvil Lanka Travels  •  info@anvillankatravels.com  •  www.anvillankatravels.com",
          50,
          doc.page.height - 38,
          { align: "center", width: pageWidth }
        );

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 38, { align: "right", width: pageWidth });
    }

    doc.end();
  });
}

export async function POST(request: NextRequest) {
  const { user, authorized } = await verifyAdminPermission(request, "bookings");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { bookingId, customNotes } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const bookingDoc = await adminDb.collection("bookings").doc(bookingId).get();
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const booking = { id: bookingDoc.id, ...bookingDoc.data() } as BookingData;

    let tour: TourData | null = null;
    if (booking.tourId) {
      const tourDoc = await adminDb.collection("tours").doc(booking.tourId).get();
      if (tourDoc.exists) {
        tour = { id: tourDoc.id, ...tourDoc.data() } as TourData;
      }
    }

    const pdfBuffer = await generateItineraryPDF(booking, tour, customNotes);

    const filename = `Itinerary-${booking.customerName.replace(/\s+/g, "_")}-${booking.id.substring(0, 8)}.pdf`;

    const uint8 = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error generating itinerary PDF:", errMsg);
    return NextResponse.json({ error: `Failed to generate itinerary: ${errMsg}` }, { status: 500 });
  }
}
