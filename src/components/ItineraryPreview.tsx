"use client";

import { useState } from "react";
import {
  X,
  Download,
  Send,
  Loader2,
  CheckCircle,
  MapPin,
  Calendar,
  Users,
  Car,
  UserCircle,
  Printer,
  FileText,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

interface TourDay {
  day: number;
  title: string;
  description: string;
  location: string;
  activities: string[];
  accommodation?: string;
}

interface TourData {
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
  specialRequests?: string;
  vehicleInfo?: {
    registrationNumber: string;
    type: string;
    brand: string;
    model: string;
  };
  guideInfo?: {
    name: string;
    phone: string;
    languages: string[];
  };
  itinerarySent?: boolean;
  itinerarySentAt?: string;
  itineraryNotes?: string;
}

interface ItineraryPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData | null;
  tour: TourData | null;
  onSent?: () => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ItineraryPreview({ isOpen, onClose, booking, tour, onSent }: ItineraryPreviewProps) {
  const { getToken } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [customNotes, setCustomNotes] = useState("");

  if (!isOpen || !booking) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          customNotes: customNotes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Download failed" }));
        throw new Error(err.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Itinerary-${booking.customerName.replace(/\s+/g, "_")}-${booking.id.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Itinerary PDF downloaded!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Download failed";
      toast.error(msg);
    } finally {
      setDownloading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/itinerary/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          customNotes: customNotes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Send failed" }));
        throw new Error(err.error || "Failed to send itinerary");
      }

      setSent(true);
      toast.success(`Itinerary sent to ${booking.customerEmail}!`);
      onSent?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Send failed";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Itinerary Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-600 dark:border-cyan-500 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </button>
            {!sent && !booking.itinerarySent && (
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send to Customer
              </button>
            )}
            {(sent || booking.itinerarySent) && (
              <span className="flex items-center gap-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                Sent
              </span>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Custom Notes Input */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20 px-6 py-4">
            <label className="mb-1.5 block text-sm font-medium text-amber-800 dark:text-amber-400">
              Custom Notes (included in PDF & email)
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add any special instructions, welcome messages, or important notes for the customer..."
              rows={2}
              className="w-full rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Preview Content */}
          <div className="p-6 space-y-6 print:p-0">
            {/* Cover Section */}
            <div className="rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 p-8 text-white text-center">
              <h1 className="text-2xl font-bold mb-1">ANVIL LANKA TRAVELS</h1>
              <p className="text-cyan-100 text-sm mb-6">Your Journey, Our Passion</p>
              <div className="w-24 h-0.5 bg-white/50 mx-auto mb-6" />
              <p className="text-cyan-100 text-xs uppercase tracking-widest mb-2">Travel Itinerary</p>
              <h2 className="text-xl font-bold mb-6">{booking.tourName}</h2>
              <div className="inline-block rounded-lg bg-white/15 px-6 py-3 text-left">
                <p className="text-sm text-cyan-100">Prepared for</p>
                <p className="text-lg font-bold">{booking.customerName}</p>
                <p className="text-sm text-cyan-100 mt-1">
                  {formatDate(booking.preferredDate)}
                  {booking.endDate ? ` — ${formatDate(booking.endDate)}` : ""}
                </p>
              </div>
            </div>

            {/* Trip Overview */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Trip Overview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Tour Type", value: booking.tourType === "multi-day" ? "Multi-Day" : booking.tourType === "day-tour" ? "Day Tour" : "Custom" },
                  ...(tour?.duration ? [{ label: "Duration", value: `${tour.duration.days}D / ${tour.duration.nights}N` }] : []),
                  { label: "Start", value: formatDate(booking.preferredDate) },
                  ...(booking.endDate ? [{ label: "End", value: formatDate(booking.endDate) }] : []),
                  { label: "Guests", value: `${booking.numberOfAdults} Adult${booking.numberOfAdults !== 1 ? "s" : ""}${booking.numberOfChildren ? `, ${booking.numberOfChildren} Child${booking.numberOfChildren !== 1 ? "ren" : ""}` : ""}` },
                  ...(booking.pickupLocation ? [{ label: "Pickup", value: booking.pickupLocation }] : []),
                  ...(booking.dropoffLocation ? [{ label: "Drop-off", value: booking.dropoffLocation }] : []),
                  ...(booking.accommodationType ? [{ label: "Accommodation", value: booking.accommodationType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") }] : []),
                ].map((item, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 dark:bg-gray-700 p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Route */}
            {tour?.route && tour.route.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
                  <MapPin className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Route
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {tour.route.map((place, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="rounded-full bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1 text-sm font-medium text-cyan-700 dark:text-cyan-400">
                        {place}
                      </span>
                      {i < tour.route!.length - 1 && <span className="text-gray-400">→</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {tour?.highlights && tour.highlights.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Highlights</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {tour.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 px-3 py-2">
                      <span className="text-cyan-600 dark:text-cyan-400 mt-0.5">●</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-Day Itinerary */}
            {tour?.itinerary && tour.itinerary.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Day-by-Day Itinerary</h3>
                <div className="space-y-4">
                  {tour.itinerary.map((day, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 px-4 py-3">
                        <span className="rounded bg-cyan-600 px-2.5 py-1 text-xs font-bold text-white">
                          DAY {day.day || index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{day.title}</h4>
                      </div>
                      <div className="p-4 space-y-3">
                        {day.location && (
                          <p className="flex items-center gap-1.5 text-sm text-cyan-600 dark:text-cyan-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {day.location}
                          </p>
                        )}
                        {day.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{day.description}</p>
                        )}
                        {day.activities && day.activities.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Activities</p>
                            <ul className="space-y-1">
                              {day.activities.map((act, ai) => (
                                <li key={ai} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="text-cyan-500 mt-0.5">▸</span>
                                  {act}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {day.accommodation && (
                          <div className="rounded bg-green-50 dark:bg-green-900/20 px-3 py-2">
                            <p className="text-sm text-green-700 dark:text-green-400">
                              🏨 {day.accommodation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicle & Guide */}
            {(booking.vehicleInfo || booking.guideInfo) && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                  <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Your Trip Team
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {booking.vehicleInfo && (
                    <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {booking.vehicleInfo.brand} {booking.vehicleInfo.model}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {booking.vehicleInfo.registrationNumber} • {booking.vehicleInfo.type}
                        </p>
                      </div>
                    </div>
                  )}
                  {booking.guideInfo && (
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                        <UserCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tour Guide</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{booking.guideInfo.name}</p>
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

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">Special Requests</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-wrap">{booking.specialRequests}</p>
              </div>
            )}

            {/* Custom Notes Preview */}
            {customNotes && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Additional Notes</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">{customNotes}</p>
              </div>
            )}

            {/* Company Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Anvil Lanka Travels</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                info@anvillankatravels.com • www.anvillankatravels.com
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your Journey, Our Passion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
