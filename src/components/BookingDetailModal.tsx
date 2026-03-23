"use client";

import { X, Mail, Phone, MapPin, Calendar, Users, CreditCard, FileText, Car, UserCircle, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/types";
import { formatDate } from "@/lib/utils";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onGenerateInvoice?: (booking: Booking) => void;
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const paymentStatusBadge: Record<string, string> = {
  unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "deposit-paid": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "fully-paid": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export default function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  onGenerateInvoice,
}: BookingDetailModalProps) {
  const router = useRouter();

  if (!isOpen || !booking) return null;

  const handleGenerateInvoice = () => {
    if (onGenerateInvoice) {
      onGenerateInvoice(booking);
    } else {
      const params = new URLSearchParams({
        bookingId: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone || "",
        customerCountry: booking.customerCountry || "",
        tourName: booking.tourName,
        tourType: booking.tourType,
        startDate: booking.preferredDate,
        endDate: booking.endDate || "",
        totalPrice: booking.totalPrice?.toString() || "",
        depositPaid: booking.depositPaid?.toString() || "",
        currency: booking.currency || "USD",
      });
      router.push(`/dashboard/invoices?create=true&${params.toString()}`);
      onClose();
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string | undefined) => {
    if (amount === undefined || amount === 0) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const totalGuests = (booking.numberOfAdults || 0) + (booking.numberOfChildren || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Booking Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusBadge[booking.status] || "bg-gray-100 text-gray-800"}`}>
              Status: {booking.status?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </span>
            {booking.paymentStatus && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${paymentStatusBadge[booking.paymentStatus] || "bg-gray-100 text-gray-800"}`}>
                Payment: {booking.paymentStatus?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </span>
            )}
          </div>

          {/* Tour Information */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              Tour Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Tour Name:</span>
                <p className="font-medium text-gray-900 dark:text-white">{booking.tourName}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {booking.tourType === "multi-day" ? "Multi-Day Tour" : 
                     booking.tourType === "day-tour" ? "Day Tour" : "Custom Package"}
                  </p>
                </div>
                {booking.accommodationType && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Accommodation:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.accommodationType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                <p className="font-medium text-gray-900 dark:text-white">{booking.customerName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Country:</span>
                <p className="font-medium text-gray-900 dark:text-white">{booking.customerCountry || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <a href={`mailto:${booking.customerEmail}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                  {booking.customerEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <a href={`tel:${booking.customerPhone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                  {booking.customerPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              Travel Details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Start Date:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.preferredDate ? formatDate(booking.preferredDate) : "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">End Date:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.endDate ? formatDate(booking.endDate) : "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Adults:</span>
                <p className="font-medium text-gray-900 dark:text-white">{booking.numberOfAdults || 0}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Children:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.numberOfChildren || 0}
                  {booking.childrenAges && ` (Ages: ${booking.childrenAges})`}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Guests:</span>
                <p className="font-medium text-gray-900 dark:text-white">{totalGuests}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Pickup:</span>
                <p className="font-medium text-gray-900 dark:text-white">{booking.pickupLocation || "—"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Drop-off:</span>
                <p className="font-medium text-gray-900 dark:text-white">{booking.dropoffLocation || "—"}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Price:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(booking.totalPrice, booking.currency)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Deposit Paid:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(booking.depositPaid, booking.currency)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Balance Due:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    (booking.totalPrice || 0) - (booking.depositPaid || 0),
                    booking.currency
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Trip Assignment */}
          {(booking.vehicleId || booking.guideId) && (
            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Trip Assignment
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {booking.vehicleId && booking.vehicleInfo && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Assigned Vehicle</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.vehicleInfo.registrationNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {booking.vehicleInfo.brand} {booking.vehicleInfo.model}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {booking.vehicleInfo.type}
                      </p>
                    </div>
                  </div>
                )}
                {booking.guideId && booking.guideInfo && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                      <UserCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Assigned Tour Guide</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.guideInfo.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {booking.guideInfo.phone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.guideInfo.languages?.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {(booking.specialRequests || booking.internalNotes) && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <div className="space-y-3">
                {booking.specialRequests && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Special Requests:</span>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}
                {booking.internalNotes && (
                  <div className="rounded bg-yellow-50 dark:bg-yellow-900/20 p-3">
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Internal Notes:</span>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
                      {booking.internalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>Created: {formatDate(booking.createdAt)}</span>
            <span>Updated: {formatDate(booking.updatedAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Close
            </button>
            <button
              onClick={handleGenerateInvoice}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Receipt className="h-4 w-4" />
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
