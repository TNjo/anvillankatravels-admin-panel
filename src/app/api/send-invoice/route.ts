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
  const { user, authorized } = await verifyAdminPermission(request, "invoices");
  if (!user) return unauthorizedResponse();
  if (!authorized) return forbiddenResponse();

  try {
    const { invoiceId, recipientEmail, recipientName } = await request.json();

    if (!invoiceId || !recipientEmail) {
      return NextResponse.json(
        { error: "Invoice ID and recipient email are required" },
        { status: 400 }
      );
    }

    const invoiceDoc = await adminDb.collection("invoices").doc(invoiceId).get();
    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() } as {
      id: string;
      invoiceNumber: string;
      customerName: string;
      customerEmail: string;
      tourName: string;
      tourType: string;
      tourDates: { start: string; end?: string };
      items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
      subtotal: number;
      taxRate?: number;
      taxAmount?: number;
      discountAmount?: number;
      discountDescription?: string;
      totalAmount: number;
      currency: string;
      amountPaid: number;
      balanceDue: number;
      status: string;
      dueDate?: string;
      notes?: string;
      terms?: string;
      issuedDate: string;
    };

    const itemsHtml = invoice.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${invoice.currency} ${item.unitPrice.toLocaleString()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${invoice.currency} ${item.total.toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
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
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
        Dear ${recipientName || invoice.customerName},
      </p>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Thank you for choosing Anvil Lanka Travels! Please find your invoice details below.
      </p>

      <!-- Invoice Info Box -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #6b7280; font-size: 12px; text-transform: uppercase;">Invoice Number</td>
            <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; text-align: right;">Issue Date</td>
          </tr>
          <tr>
            <td style="color: #111827; font-size: 18px; font-weight: bold;">${invoice.invoiceNumber}</td>
            <td style="color: #111827; font-size: 16px; text-align: right;">${new Date(invoice.issuedDate).toLocaleDateString()}</td>
          </tr>
        </table>
      </div>

      <!-- Tour Info -->
      <div style="background: #ecfeff; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0e7490; margin: 0 0 8px 0; font-size: 16px;">${invoice.tourName}</h3>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          ${invoice.tourType === "multi-day" ? "Multi-day Tour" : invoice.tourType === "day-tour" ? "Day Tour" : "Custom Tour"}
          ${invoice.tourDates?.start ? ` • ${new Date(invoice.tourDates.start).toLocaleDateString()}${invoice.tourDates.end ? ` - ${new Date(invoice.tourDates.end).toLocaleDateString()}` : ""}` : ""}
        </p>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Description</th>
            <th style="padding: 12px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Qty</th>
            <th style="padding: 12px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Price</th>
            <th style="padding: 12px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="margin-left: auto; width: 250px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
          <span style="color: #6b7280;">Subtotal</span>
          <span style="color: #111827;">${invoice.currency} ${invoice.subtotal.toLocaleString()}</span>
        </div>
        ${invoice.taxRate && invoice.taxRate > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
          <span style="color: #6b7280;">Tax (${invoice.taxRate}%)</span>
          <span style="color: #111827;">${invoice.currency} ${(invoice.taxAmount || 0).toLocaleString()}</span>
        </div>
        ` : ""}
        ${invoice.discountAmount && invoice.discountAmount > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
          <span style="color: #6b7280;">Discount</span>
          <span style="color: #dc2626;">-${invoice.currency} ${invoice.discountAmount.toLocaleString()}</span>
        </div>
        ` : ""}
        <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #111827; margin-top: 8px;">
          <span style="color: #111827;">Total</span>
          <span style="color: #111827;">${invoice.currency} ${invoice.totalAmount.toLocaleString()}</span>
        </div>
        ${invoice.amountPaid > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
          <span style="color: #059669;">Amount Paid</span>
          <span style="color: #059669;">-${invoice.currency} ${invoice.amountPaid.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; font-weight: 600;">
          <span style="color: ${invoice.balanceDue > 0 ? "#dc2626" : "#059669"};">Balance Due</span>
          <span style="color: ${invoice.balanceDue > 0 ? "#dc2626" : "#059669"};">${invoice.currency} ${invoice.balanceDue.toLocaleString()}</span>
        </div>
        ` : ""}
      </div>

      ${invoice.dueDate ? `
      <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          <strong>Payment Due:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}
        </p>
      </div>
      ` : ""}

      ${invoice.notes ? `
      <div style="margin: 20px 0;">
        <h4 style="color: #374151; font-size: 14px; margin: 0 0 8px 0;">Notes</h4>
        <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">${invoice.notes}</p>
      </div>
      ` : ""}

      ${invoice.terms ? `
      <div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <h4 style="color: #374151; font-size: 14px; margin: 0 0 8px 0;">Terms & Conditions</h4>
        <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">${invoice.terms}</p>
      </div>
      ` : ""}

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
      from: process.env.RESEND_FROM_EMAIL || "Anvil Lanka Travels <invoices@anvillankatravels.com>",
      to: [recipientEmail],
      subject: `Invoice ${invoice.invoiceNumber} - Anvil Lanka Travels`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    }

    await adminDb.collection("invoices").doc(invoiceId).update({
      status: "sent",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: `Invoice sent successfully to ${recipientEmail}`,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: "Failed to send invoice email" },
      { status: 500 }
    );
  }
}
