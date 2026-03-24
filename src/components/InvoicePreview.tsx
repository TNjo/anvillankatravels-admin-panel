"use client";

import { useRef, useState } from "react";
import { X, Printer, Download, Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import type { Invoice } from "@/types";

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
  onStatusUpdate?: (invoice: Invoice) => void;
}

export default function InvoicePreview({ invoice, onClose, onStatusUpdate }: InvoicePreviewProps) {
  const { getToken } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendEmail = async () => {
    console.log("=== Send Invoice Email Started ===");
    console.log("Invoice ID:", invoice.id);
    console.log("Recipient:", invoice.customerEmail);
    setSending(true);
    try {
      const token = await getToken();
      console.log("Auth token obtained:", token ? "yes" : "NO TOKEN");

      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        setSending(false);
        return;
      }

      console.log("Sending API request...");
      const res = await fetch("/api/send-invoice", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          recipientEmail: invoice.customerEmail,
          recipientName: invoice.customerName,
        }),
      });

      console.log("API response status:", res.status);
      const data = await res.json();
      console.log("API response data:", data);

      if (res.ok) {
        setSent(true);
        toast.success(`Invoice sent to ${invoice.customerEmail}`);
        if (onStatusUpdate) {
          onStatusUpdate({ ...invoice, status: "sent" });
        }
      } else {
        console.error("API error:", data);
        toast.error(data.error || "Failed to send invoice");
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice. Check console for details.");
    } finally {
      setSending(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; }
            .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #0891b2; }
            .logo-sub { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { font-size: 32px; color: #1f2937; margin-bottom: 8px; }
            .invoice-number { font-size: 14px; color: #6b7280; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .status-paid { background: #d1fae5; color: #065f46; }
            .status-sent { background: #dbeafe; color: #1e40af; }
            .status-draft { background: #f3f4f6; color: #374151; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .info-block { flex: 1; }
            .info-block h3 { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .info-block p { font-size: 14px; margin-bottom: 4px; }
            .info-block .name { font-weight: 600; font-size: 16px; }
            .tour-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .tour-info h3 { font-size: 18px; margin-bottom: 8px; }
            .tour-info p { font-size: 14px; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 12px; text-transform: uppercase; color: #6b7280; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .text-right { text-align: right; }
            .totals { margin-left: auto; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .totals-row.total { border-top: 2px solid #1f2937; font-size: 18px; font-weight: bold; padding-top: 12px; margin-top: 8px; }
            .totals-row.discount { color: #dc2626; }
            .notes { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            .notes h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
            .notes p { font-size: 13px; color: #6b7280; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .invoice { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = () => {
    handlePrint();
  };

  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} - Anvil Lanka Travels`);
    const body = encodeURIComponent(
      `Dear ${invoice.customerName},\n\nPlease find attached your invoice ${invoice.invoiceNumber} for ${invoice.tourName}.\n\nTotal Amount: ${invoice.currency} ${invoice.totalAmount.toLocaleString()}\nDue Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Upon receipt"}\n\nThank you for choosing Anvil Lanka Travels!\n\nBest regards,\nAnvil Lanka Travels Team`
    );
    window.open(`mailto:${invoice.customerEmail}?subject=${subject}&body=${body}`);
  };

  const statusClass = {
    draft: "status-draft",
    sent: "status-sent",
    paid: "status-paid",
    "partially-paid": "status-sent",
    overdue: "status-overdue",
    cancelled: "status-draft",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-gray-50 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Invoice Preview</h2>
          <div className="flex items-center gap-2">
            {/* Send to Customer Button */}
            <button
              onClick={handleSendEmail}
              disabled={sending || sent || invoice.status === "paid"}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                sent
                  ? "bg-green-100 text-green-700 cursor-default"
                  : invoice.status === "paid"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              } disabled:opacity-70`}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : sent ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to Customer
                </>
              )}
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <button
              onClick={handleOpenMailClient}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              title="Open in email client"
            >
              <Mail className="h-4 w-4" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(95vh - 60px)" }}>
          <div ref={printRef} className="invoice bg-white">
            {/* Header */}
            <div className="header">
              <div>
                <div className="logo">Anvil Lanka</div>
                <div className="logo-sub">Travels & Tours</div>
                <p style={{ marginTop: "12px", fontSize: "13px", color: "#6b7280" }}>
                  Colombo, Sri Lanka<br />
                  info@anvillankatravels.com<br />
                  +94 77 123 4567
                </p>
              </div>
              <div className="invoice-title">
                <h1>INVOICE</h1>
                <p className="invoice-number">{invoice.invoiceNumber}</p>
                <div style={{ marginTop: "12px" }}>
                  <span className={`status ${statusClass[invoice.status]}`}>
                    {invoice.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="info-section">
              <div className="info-block">
                <h3>Bill To</h3>
                <p className="name">{invoice.customerName}</p>
                <p>{invoice.customerEmail}</p>
                {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
                {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
                {invoice.customerCountry && <p>{invoice.customerCountry}</p>}
              </div>
              <div className="info-block" style={{ textAlign: "right" }}>
                <h3>Invoice Details</h3>
                <p><strong>Issue Date:</strong> {new Date(invoice.issuedDate).toLocaleDateString()}</p>
                {invoice.dueDate && (
                  <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                )}
                {invoice.paidDate && (
                  <p><strong>Paid Date:</strong> {new Date(invoice.paidDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {/* Tour Info */}
            <div className="tour-info">
              <h3>{invoice.tourName}</h3>
              <p>
                {invoice.tourType === "multi-day" ? "Multi-day Tour" : 
                 invoice.tourType === "day-tour" ? "Day Tour" : "Custom Tour"}
                {invoice.tourDates?.start && (
                  <> • {new Date(invoice.tourDates.start).toLocaleDateString()}
                    {invoice.tourDates.end && ` - ${new Date(invoice.tourDates.end).toLocaleDateString()}`}
                  </>
                )}
              </p>
            </div>

            {/* Items Table */}
            <table>
              <thead>
                <tr>
                  <th style={{ width: "50%" }}>Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{invoice.currency} {item.unitPrice.toLocaleString()}</td>
                    <td className="text-right">{invoice.currency} {item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{invoice.currency} {invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.taxRate && invoice.taxRate > 0 && (
                <div className="totals-row">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span>{invoice.currency} {(invoice.taxAmount || 0).toLocaleString()}</span>
                </div>
              )}
              {invoice.discountAmount && invoice.discountAmount > 0 && (
                <div className="totals-row discount">
                  <span>Discount {invoice.discountDescription && `(${invoice.discountDescription})`}</span>
                  <span>-{invoice.currency} {invoice.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="totals-row total">
                <span>Total</span>
                <span>{invoice.currency} {invoice.totalAmount.toLocaleString()}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <>
                  <div className="totals-row" style={{ color: "#059669" }}>
                    <span>Amount Paid</span>
                    <span>-{invoice.currency} {invoice.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="totals-row" style={{ fontWeight: "600", color: invoice.balanceDue > 0 ? "#dc2626" : "#059669" }}>
                    <span>Balance Due</span>
                    <span>{invoice.currency} {invoice.balanceDue.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="notes">
                {invoice.notes && (
                  <div style={{ marginBottom: "16px" }}>
                    <h3>Notes</h3>
                    <p>{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h3>Terms & Conditions</h3>
                    <p>{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="footer">
              <p>Thank you for choosing Anvil Lanka Travels!</p>
              <p style={{ marginTop: "8px" }}>
                For questions about this invoice, please contact us at info@anvillankatravels.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
