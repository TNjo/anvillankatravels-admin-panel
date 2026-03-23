"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Loader2,
  Car,
  UserCircle,
  User,
  MapPin,
  CreditCard,
  Users,
  FileText,
  ClipboardCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import type { Booking, Tour, DayTour, Vehicle, TourGuide } from "@/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Partial<Booking>) => Promise<void>;
  booking?: Booking | null;
  tours: Tour[];
  dayTours: DayTour[];
  vehicles?: Vehicle[];
  guides?: TourGuide[];
  getToken: () => Promise<string | null>;
}

const STATUS_OPTIONS = ["pending", "confirmed", "in-progress", "completed", "cancelled"] as const;
const TOUR_TYPE_OPTIONS = ["multi-day", "day-tour", "custom"] as const;
const ACCOMMODATION_OPTIONS = ["budget", "mid-range", "luxury", "not-required"] as const;
const PAYMENT_STATUS_OPTIONS = ["unpaid", "deposit-paid", "fully-paid", "refunded"] as const;
const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "LKR"] as const;

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="col-span-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
        <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
        {title}
      </h3>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

interface AvailabilityConflict {
  bookingId: string;
  customerName: string;
  tourName: string;
  startDate: string;
  endDate: string;
  vehicleId?: string;
  guideId?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  onSave,
  booking,
  tours,
  dayTours,
  vehicles = [],
  guides = [],
  getToken,
}: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [bookedVehicleIds, setBookedVehicleIds] = useState<string[]>([]);
  const [bookedGuideIds, setBookedGuideIds] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<AvailabilityConflict[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Booking>>({
    tourType: "multi-day",
    tourId: "",
    tourName: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCountry: "",
    numberOfAdults: 1,
    numberOfChildren: 0,
    childrenAges: "",
    preferredDate: "",
    endDate: "",
    pickupLocation: "",
    dropoffLocation: "",
    accommodationType: "mid-range",
    totalPrice: 0,
    currency: "USD",
    depositPaid: 0,
    paymentStatus: "unpaid",
    specialRequests: "",
    internalNotes: "",
    status: "pending",
    vehicleId: "",
    guideId: "",
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        tourType: booking.tourType || "multi-day",
        tourId: booking.tourId || "",
        tourName: booking.tourName || "",
        customerName: booking.customerName || "",
        customerEmail: booking.customerEmail || "",
        customerPhone: booking.customerPhone || "",
        customerCountry: booking.customerCountry || "",
        numberOfAdults: booking.numberOfAdults || 1,
        numberOfChildren: booking.numberOfChildren || 0,
        childrenAges: booking.childrenAges || "",
        preferredDate: booking.preferredDate || "",
        endDate: booking.endDate || "",
        pickupLocation: booking.pickupLocation || "",
        dropoffLocation: booking.dropoffLocation || "",
        accommodationType: booking.accommodationType || "mid-range",
        totalPrice: booking.totalPrice || 0,
        currency: booking.currency || "USD",
        depositPaid: booking.depositPaid || 0,
        paymentStatus: booking.paymentStatus || "unpaid",
        specialRequests: booking.specialRequests || "",
        internalNotes: booking.internalNotes || "",
        status: booking.status || "pending",
        vehicleId: booking.vehicleId || "",
        guideId: booking.guideId || "",
      });
    } else {
      setFormData({
        tourType: "multi-day",
        tourId: "",
        tourName: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerCountry: "",
        numberOfAdults: 1,
        numberOfChildren: 0,
        childrenAges: "",
        preferredDate: "",
        endDate: "",
        pickupLocation: "",
        dropoffLocation: "",
        accommodationType: "mid-range",
        totalPrice: 0,
        currency: "USD",
        depositPaid: 0,
        paymentStatus: "unpaid",
        specialRequests: "",
        internalNotes: "",
        status: "pending",
        vehicleId: "",
        guideId: "",
      });
    }
  }, [booking, isOpen]);

  const checkAvailability = useCallback(
    async (startDate: string, endDate: string) => {
      if (!startDate) {
        setBookedVehicleIds([]);
        setBookedGuideIds([]);
        setConflicts([]);
        return;
      }
      setAvailabilityLoading(true);
      try {
        const token = await getToken();
        const params = new URLSearchParams({ startDate, endDate: endDate || startDate });
        if (booking?.id) params.set("excludeBookingId", booking.id);
        const res = await fetch(`/api/bookings/check-availability?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBookedVehicleIds(data.bookedVehicleIds || []);
          setBookedGuideIds(data.bookedGuideIds || []);
          setConflicts(data.conflicts || []);
        }
      } catch {
        // Silently fail - availability is a helper, not critical
      } finally {
        setAvailabilityLoading(false);
      }
    },
    [getToken, booking?.id]
  );

  useEffect(() => {
    if (isOpen && formData.preferredDate) {
      checkAvailability(formData.preferredDate, formData.endDate || "");
    }
  }, [isOpen, formData.preferredDate, formData.endDate, checkAvailability]);

  const handleVehicleSelect = (vehicleId: string) => {
    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    if (selectedVehicle) {
      setFormData({
        ...formData,
        vehicleId: selectedVehicle.id,
        vehicleInfo: {
          registrationNumber: selectedVehicle.registrationNumber,
          type: selectedVehicle.type,
          brand: selectedVehicle.brand,
          model: selectedVehicle.model,
        },
      });
    } else {
      setFormData({
        ...formData,
        vehicleId: "",
        vehicleInfo: undefined,
      });
    }
  };

  const handleGuideSelect = (guideId: string) => {
    const selectedGuide = guides.find((g) => g.id === guideId);
    if (selectedGuide) {
      setFormData({
        ...formData,
        guideId: selectedGuide.id,
        guideInfo: {
          name: selectedGuide.name,
          phone: selectedGuide.phone,
          languages: selectedGuide.languages,
        },
      });
    } else {
      setFormData({
        ...formData,
        guideId: "",
        guideInfo: undefined,
      });
    }
  };

  const calculateEndDate = (startDate: string, durationDays: number): string => {
    if (!startDate || !durationDays) return "";
    const start = new Date(startDate);
    start.setDate(start.getDate() + durationDays - 1);
    return start.toISOString().split("T")[0];
  };

  const handleTourSelect = (tourId: string) => {
    if (formData.tourType === "multi-day") {
      const selectedTour = tours.find((t) => t.id === tourId);
      if (selectedTour) {
        const endDate =
          selectedTour.duration?.days && formData.preferredDate
            ? calculateEndDate(formData.preferredDate, selectedTour.duration.days)
            : formData.endDate || "";
        setFormData({
          ...formData,
          tourId: selectedTour.id,
          tourName: selectedTour.name,
          endDate,
        });
      }
    } else if (formData.tourType === "day-tour") {
      const selectedTour = dayTours.find((t) => t.id === tourId);
      if (selectedTour) {
        setFormData({
          ...formData,
          tourId: selectedTour.id,
          tourName: selectedTour.name,
        });
      }
    }
  };

  const handleStartDateChange = (date: string) => {
    const selectedTour =
      formData.tourType === "multi-day"
        ? tours.find((t) => t.id === formData.tourId)
        : null;
    const endDate =
      selectedTour?.duration?.days && date
        ? calculateEndDate(date, selectedTour.duration.days)
        : formData.endDate || "";
    setFormData({ ...formData, preferredDate: date, endDate });
  };

  const handleStatusChange = (status: string) => {
    if (status === "confirmed" && formData.paymentStatus === "unpaid") {
      return;
    }
    setFormData({ ...formData, status: status as Booking["status"] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableTours = formData.tourType === "multi-day" ? tours : dayTours;
  const balanceDue = (formData.totalPrice || 0) - (formData.depositPaid || 0);
  const canConfirm = formData.paymentStatus !== "unpaid";
  const selectedMultiDayTour =
    formData.tourType === "multi-day" ? tours.find((t) => t.id === formData.tourId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {booking ? "Edit Booking" : "Add New Booking"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {booking ? "Update the booking details below" : "Fill in the details to create a new booking"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">

          {/* ──────────────── 1. Customer Information ──────────────── */}
          <div className="grid gap-5 md:grid-cols-2">
            <SectionHeader icon={User} title="Customer Information" />

            <div>
              <FieldLabel required>Full Name</FieldLabel>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="input"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <FieldLabel required>Email Address</FieldLabel>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                className="input"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <FieldLabel required>Phone Number</FieldLabel>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                className="input"
                placeholder="+1 234 567 8900"
                required
              />
            </div>

            <div>
              <FieldLabel>Country</FieldLabel>
              <input
                type="text"
                value={formData.customerCountry}
                onChange={(e) =>
                  setFormData({ ...formData, customerCountry: e.target.value })
                }
                className="input"
                placeholder="Country of residence"
              />
            </div>
          </div>

          {/* ──────────────── 2. Tour Selection ──────────────── */}
          <div className="grid gap-5 md:grid-cols-2">
            <SectionHeader icon={MapPin} title="Tour Selection" />

            <div>
              <FieldLabel required>Tour Type</FieldLabel>
              <select
                value={formData.tourType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tourType: e.target.value as Booking["tourType"],
                    tourId: "",
                    tourName: "",
                    endDate: "",
                  })
                }
                className="input"
                required
              >
                {TOUR_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type === "multi-day"
                      ? "Multi-Day Tour"
                      : type === "day-tour"
                      ? "Day Tour"
                      : "Custom Package"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel required={formData.tourType !== "custom"}>
                {formData.tourType === "custom" ? "Custom Tour Name" : "Select Tour"}
              </FieldLabel>
              {formData.tourType === "custom" ? (
                <input
                  type="text"
                  value={formData.tourName}
                  onChange={(e) =>
                    setFormData({ ...formData, tourName: e.target.value })
                  }
                  className="input"
                  placeholder="Enter custom tour name"
                  required
                />
              ) : (
                <select
                  value={formData.tourId}
                  onChange={(e) => handleTourSelect(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select a tour</option>
                  {availableTours.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedMultiDayTour?.duration?.days && (
                <p className="mt-1.5 text-xs text-primary-600 dark:text-primary-400">
                  Duration: {selectedMultiDayTour.duration.days} Days / {selectedMultiDayTour.duration.nights} Nights
                </p>
              )}
            </div>

            <div>
              <FieldLabel required>Start Date</FieldLabel>
              <input
                type="date"
                value={formData.preferredDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <FieldLabel>End Date</FieldLabel>
              <input
                type="date"
                value={formData.endDate}
                min={formData.preferredDate || new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="input"
              />
              {selectedMultiDayTour?.duration?.days && formData.endDate && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Auto-calculated from tour duration
                </p>
              )}
            </div>
          </div>

          {/* ──────────────── 3. Guest & Travel Details ──────────────── */}
          <div className="grid gap-5 md:grid-cols-2">
            <SectionHeader icon={Users} title="Guests & Travel Details" />

            <div>
              <FieldLabel required>Number of Adults</FieldLabel>
              <input
                type="number"
                min="1"
                value={formData.numberOfAdults}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfAdults: parseInt(e.target.value) || 1,
                  })
                }
                className="input"
                required
              />
            </div>

            <div>
              <FieldLabel>Number of Children</FieldLabel>
              <input
                type="number"
                min="0"
                value={formData.numberOfChildren}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfChildren: parseInt(e.target.value) || 0,
                  })
                }
                className="input"
              />
            </div>

            {(formData.numberOfChildren ?? 0) > 0 && (
              <div className="col-span-2">
                <FieldLabel>Children Ages</FieldLabel>
                <input
                  type="text"
                  value={formData.childrenAges}
                  onChange={(e) =>
                    setFormData({ ...formData, childrenAges: e.target.value })
                  }
                  className="input"
                  placeholder="e.g., 5, 8, 12"
                />
              </div>
            )}

            <div>
              <FieldLabel>Pickup Location</FieldLabel>
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) =>
                  setFormData({ ...formData, pickupLocation: e.target.value })
                }
                className="input"
                placeholder="Airport, hotel, etc."
              />
            </div>

            <div>
              <FieldLabel>Drop-off Location</FieldLabel>
              <input
                type="text"
                value={formData.dropoffLocation}
                onChange={(e) =>
                  setFormData({ ...formData, dropoffLocation: e.target.value })
                }
                className="input"
                placeholder="Airport, hotel, etc."
              />
            </div>

            <div>
              <FieldLabel>Accommodation Type</FieldLabel>
              <select
                value={formData.accommodationType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accommodationType: e.target.value as Booking["accommodationType"],
                  })
                }
                className="input"
              >
                {ACCOMMODATION_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ──────────────── 4. Payment Information ──────────────── */}
          <div className="grid gap-5 md:grid-cols-2">
            <SectionHeader icon={CreditCard} title="Payment Information" />

            <div>
              <FieldLabel>Total Price</FieldLabel>
              <div className="flex gap-2">
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="input w-24"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input flex-1"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Deposit Paid</FieldLabel>
              <input
                type="number"
                min="0"
                step="0.01"
                max={formData.totalPrice || undefined}
                value={formData.depositPaid}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    depositPaid: parseFloat(e.target.value) || 0,
                  })
                }
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <FieldLabel>Payment Status</FieldLabel>
              <select
                value={formData.paymentStatus}
                onChange={(e) => {
                  const newPaymentStatus = e.target.value as Booking["paymentStatus"];
                  const updates: Partial<Booking> = { ...formData, paymentStatus: newPaymentStatus };
                  if (newPaymentStatus === "unpaid" && formData.status === "confirmed") {
                    updates.status = "pending";
                  }
                  setFormData(updates);
                }}
                className="input"
              >
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Balance Due Summary */}
            {(formData.totalPrice ?? 0) > 0 && (
              <div className="flex items-center">
                <div className={`w-full rounded-lg px-4 py-3 ${
                  balanceDue > 0
                    ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                    : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                }`}>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Balance Due</p>
                  <p className={`text-lg font-bold ${
                    balanceDue > 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-green-700 dark:text-green-400"
                  }`}>
                    {formData.currency} {balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ──────────────── 5. Trip Assignment ──────────────── */}
          <div className="grid gap-5 md:grid-cols-2">
            <SectionHeader icon={Car} title="Trip Assignment" />

            {!formData.preferredDate && (
              <div className="col-span-2 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3">
                <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Select tour dates first to check vehicle and guide availability.
                </p>
              </div>
            )}

            {availabilityLoading && formData.preferredDate && (
              <div className="col-span-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Checking availability for selected dates...
              </div>
            )}

            <div>
              <FieldLabel>
                <span className="flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5 text-gray-400" />
                  Assign Vehicle
                </span>
              </FieldLabel>
              <select
                value={formData.vehicleId || ""}
                onChange={(e) => handleVehicleSelect(e.target.value)}
                className="input"
              >
                <option value="">No vehicle assigned</option>
                {vehicles
                  .filter((v) => v.status === "available" || v.id === formData.vehicleId)
                  .map((vehicle) => {
                    const isBooked = bookedVehicleIds.includes(vehicle.id) && vehicle.id !== formData.vehicleId;
                    return (
                      <option key={vehicle.id} value={vehicle.id} disabled={isBooked}>
                        {vehicle.registrationNumber} - {vehicle.brand} {vehicle.model} ({vehicle.capacity} seats)
                        {isBooked ? " [Booked on these dates]" : ""}
                        {!isBooked && vehicle.status !== "available" ? ` [${vehicle.status}]` : ""}
                      </option>
                    );
                  })}
              </select>
              {formData.vehicleId && formData.vehicleInfo && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {formData.vehicleInfo.brand} {formData.vehicleInfo.model} ({formData.vehicleInfo.type})
                </p>
              )}
              {formData.vehicleId && bookedVehicleIds.includes(formData.vehicleId) && (
                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    This vehicle is assigned to another booking on the selected dates.
                    {conflicts.find((c) => c.vehicleId === formData.vehicleId) && (
                      <> ({conflicts.find((c) => c.vehicleId === formData.vehicleId)?.customerName} — {conflicts.find((c) => c.vehicleId === formData.vehicleId)?.tourName})</>
                    )}
                  </span>
                </div>
              )}
            </div>

            <div>
              <FieldLabel>
                <span className="flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5 text-gray-400" />
                  Assign Tour Guide
                </span>
              </FieldLabel>
              <select
                value={formData.guideId || ""}
                onChange={(e) => handleGuideSelect(e.target.value)}
                className="input"
              >
                <option value="">No guide assigned</option>
                {guides
                  .filter((g) => g.status === "available" || g.id === formData.guideId)
                  .map((guide) => {
                    const isBooked = bookedGuideIds.includes(guide.id) && guide.id !== formData.guideId;
                    return (
                      <option key={guide.id} value={guide.id} disabled={isBooked}>
                        {guide.name} - {guide.languages?.slice(0, 2).join(", ")}
                        {isBooked ? " [Booked on these dates]" : ""}
                        {!isBooked && guide.status !== "available" ? ` [${guide.status}]` : ""}
                      </option>
                    );
                  })}
              </select>
              {formData.guideId && formData.guideInfo && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {formData.guideInfo.name} ({formData.guideInfo.languages?.join(", ")})
                </p>
              )}
              {formData.guideId && bookedGuideIds.includes(formData.guideId) && (
                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    This guide is assigned to another booking on the selected dates.
                    {conflicts.find((c) => c.guideId === formData.guideId) && (
                      <> ({conflicts.find((c) => c.guideId === formData.guideId)?.customerName} — {conflicts.find((c) => c.guideId === formData.guideId)?.tourName})</>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ──────────────── 6. Additional Notes ──────────────── */}
          <div className="grid gap-5 md:grid-cols-2">
            <SectionHeader icon={FileText} title="Additional Notes" />

            <div className="col-span-2">
              <FieldLabel>Special Requests (Customer)</FieldLabel>
              <textarea
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                className="input min-h-[80px] resize-y"
                placeholder="Dietary requirements, accessibility needs, etc."
              />
            </div>

            <div className="col-span-2">
              <FieldLabel>Internal Notes (Admin Only)</FieldLabel>
              <textarea
                value={formData.internalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, internalNotes: e.target.value })
                }
                className="input min-h-[80px] resize-y"
                placeholder="Notes for internal use only..."
              />
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                This will not be visible to the customer.
              </p>
            </div>
          </div>

          {/* ──────────────── 7. Booking Status ──────────────── */}
          <div className="grid gap-5 md:grid-cols-2">
            <SectionHeader icon={ClipboardCheck} title="Booking Status" />

            <div className="col-span-2 md:col-span-1">
              <FieldLabel required>Status</FieldLabel>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input"
                required
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status}
                    value={status}
                    disabled={status === "confirmed" && !canConfirm}
                  >
                    {status
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                    {status === "confirmed" && !canConfirm ? " (requires payment)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {!canConfirm && (
              <div className="col-span-2 md:col-span-1 flex items-end">
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 w-full">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    Booking cannot be confirmed while payment status is <strong>Unpaid</strong>. Please update the payment status first.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ──────────────── Form Actions ──────────────── */}
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {booking ? "Update Booking" : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
