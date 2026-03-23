"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Car, UserCircle } from "lucide-react";
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
}

const STATUS_OPTIONS = ["pending", "confirmed", "in-progress", "completed", "cancelled"] as const;
const TOUR_TYPE_OPTIONS = ["multi-day", "day-tour", "custom"] as const;
const ACCOMMODATION_OPTIONS = ["budget", "mid-range", "luxury", "not-required"] as const;
const PAYMENT_STATUS_OPTIONS = ["unpaid", "deposit-paid", "fully-paid", "refunded"] as const;

export default function BookingModal({
  isOpen,
  onClose,
  onSave,
  booking,
  tours,
  dayTours,
  vehicles = [],
  guides = [],
}: BookingModalProps) {
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {booking ? "Edit Booking" : "Add New Booking"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tour Information Section */}
            <div className="col-span-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tour Information
              </h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tour Type *
              </label>
              <select
                value={formData.tourType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tourType: e.target.value as Booking["tourType"],
                    tourId: "",
                    tourName: "",
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Tour {formData.tourType !== "custom" && "*"}
              </label>
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
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date *
              </label>
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                min={formData.preferredDate || new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="input"
              />
            </div>

            {/* Customer Information Section */}
            <div className="col-span-2 mt-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Customer Information
              </h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="input"
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                className="input"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone *
              </label>
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
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

            {/* Guest Information Section */}
            <div className="col-span-2 mt-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Guest Details
              </h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Adults *
              </label>
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Children
              </label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Children Ages
                </label>
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

            {/* Travel Details Section */}
            <div className="col-span-2 mt-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Travel Details
              </h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pickup Location
              </label>
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop-off Location
              </label>
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Accommodation Type
              </label>
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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Booking["status"],
                  })
                }
                className="input"
                required
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Section */}
            <div className="col-span-2 mt-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payment Information
              </h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Price
              </label>
              <div className="flex gap-2">
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
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="input w-24"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="LKR">LKR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deposit Paid
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
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
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentStatus: e.target.value as Booking["paymentStatus"],
                  })
                }
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

            {/* Assignment Section */}
            <div className="col-span-2 mt-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Trip Assignment
              </h3>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Assign Vehicle
                </span>
              </label>
              <select
                value={formData.vehicleId || ""}
                onChange={(e) => handleVehicleSelect(e.target.value)}
                className="input"
              >
                <option value="">No vehicle assigned</option>
                {vehicles
                  .filter((v) => v.status === "available" || v.id === formData.vehicleId)
                  .map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber} - {vehicle.brand} {vehicle.model} ({vehicle.capacity} seats)
                      {vehicle.status !== "available" && ` [${vehicle.status}]`}
                    </option>
                  ))}
              </select>
              {formData.vehicleId && formData.vehicleInfo && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Selected: {formData.vehicleInfo.brand} {formData.vehicleInfo.model} ({formData.vehicleInfo.type})
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Assign Tour Guide
                </span>
              </label>
              <select
                value={formData.guideId || ""}
                onChange={(e) => handleGuideSelect(e.target.value)}
                className="input"
              >
                <option value="">No guide assigned</option>
                {guides
                  .filter((g) => g.status === "available" || g.id === formData.guideId)
                  .map((guide) => (
                    <option key={guide.id} value={guide.id}>
                      {guide.name} - {guide.languages?.slice(0, 2).join(", ")}
                      {guide.status !== "available" && ` [${guide.status}]`}
                    </option>
                  ))}
              </select>
              {formData.guideId && formData.guideInfo && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Selected: {formData.guideInfo.name} ({formData.guideInfo.languages?.join(", ")})
                </p>
              )}
            </div>

            {/* Notes Section */}
            <div className="col-span-2 mt-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Additional Information
              </h3>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Special Requests (Customer)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                className="input min-h-[80px]"
                placeholder="Dietary requirements, accessibility needs, etc."
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Internal Notes (Admin Only)
              </label>
              <textarea
                value={formData.internalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, internalNotes: e.target.value })
                }
                className="input min-h-[80px]"
                placeholder="Notes for internal use only..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
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
