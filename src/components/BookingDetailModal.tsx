"use client";

import { X, Mail, Phone, MapPin, Calendar, Users, CreditCard, FileText } from "lucide-react";
import type { Booking } from "@/types";
import { formatDate } from "@/lib/utils";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusBadge: Record<string, string> = {
  unpaid: "bg-red-100 text-red-800",
  "deposit-paid": "bg-yellow-100 text-yellow-800",
  "fully-paid": "bg-green-100 text-green-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function BookingDetailModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailModalProps) {
  if (!isOpen || !booking) return null;

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
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
            <p className="text-sm text-gray-500">ID: {booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              <MapPin className="h-4 w-4" />
              Tour Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Tour Name:</span>
                <p className="font-medium text-gray-900">{booking.tourName}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="text-sm text-gray-500">Type:</span>
                  <p className="font-medium text-gray-900">
                    {booking.tourType === "multi-day" ? "Multi-Day Tour" : 
                     booking.tourType === "day-tour" ? "Day Tour" : "Custom Package"}
                  </p>
                </div>
                {booking.accommodationType && (
                  <div>
                    <span className="text-sm text-gray-500">Accommodation:</span>
                    <p className="font-medium text-gray-900">
                      {booking.accommodationType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              <Users className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-sm text-gray-500">Name:</span>
                <p className="font-medium text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Country:</span>
                <p className="font-medium text-gray-900">{booking.customerCountry || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${booking.customerEmail}`} className="text-primary-600 hover:underline">
                  {booking.customerEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${booking.customerPhone}`} className="text-primary-600 hover:underline">
                  {booking.customerPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              <Calendar className="h-4 w-4" />
              Travel Details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-sm text-gray-500">Start Date:</span>
                <p className="font-medium text-gray-900">
                  {booking.preferredDate ? formatDate(booking.preferredDate) : "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">End Date:</span>
                <p className="font-medium text-gray-900">
                  {booking.endDate ? formatDate(booking.endDate) : "—"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Adults:</span>
                <p className="font-medium text-gray-900">{booking.numberOfAdults || 0}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Children:</span>
                <p className="font-medium text-gray-900">
                  {booking.numberOfChildren || 0}
                  {booking.childrenAges && ` (Ages: ${booking.childrenAges})`}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Guests:</span>
                <p className="font-medium text-gray-900">{totalGuests}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Pickup:</span>
                <p className="font-medium text-gray-900">{booking.pickupLocation || "—"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Drop-off:</span>
                <p className="font-medium text-gray-900">{booking.dropoffLocation || "—"}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <span className="text-sm text-gray-500">Total Price:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(booking.totalPrice, booking.currency)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Deposit Paid:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(booking.depositPaid, booking.currency)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Balance Due:</span>
                <p className="font-medium text-gray-900">
                  {formatCurrency(
                    (booking.totalPrice || 0) - (booking.depositPaid || 0),
                    booking.currency
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(booking.specialRequests || booking.internalNotes) && (
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <div className="space-y-3">
                {booking.specialRequests && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Special Requests:</span>
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}
                {booking.internalNotes && (
                  <div className="rounded bg-yellow-50 p-3">
                    <span className="text-sm font-medium text-yellow-800">Internal Notes:</span>
                    <p className="mt-1 text-sm text-yellow-700 whitespace-pre-wrap">
                      {booking.internalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex justify-between text-xs text-gray-400">
            <span>Created: {formatDate(booking.createdAt)}</span>
            <span>Updated: {formatDate(booking.updatedAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
