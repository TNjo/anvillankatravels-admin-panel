"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRequirePermission } from "@/lib/useRequirePermission";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Car,
  UserCircle,
  MapPin,
  Users,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { Booking, Vehicle, TourGuide } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  "in-progress": "bg-blue-500",
  completed: "bg-gray-400",
  cancelled: "bg-red-400",
};

const statusBgColors: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
  confirmed: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
  "in-progress": "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
  completed: "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
  cancelled: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700",
};

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

export default function CalendarPage() {
  const { authorized: permAuthorized, loading: permLoading } = useRequirePermission("calendar");
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVehicle, setFilterVehicle] = useState<string>("all");
  const [filterGuide, setFilterGuide] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [bookingsRes, vehiclesRes, guidesRes] = await Promise.all([
        fetch("/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/vehicles", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/tour-guides", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json());
      if (guidesRes.ok) setGuides(await guidesRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (filterStatus !== "all" && booking.status !== filterStatus) return false;
      if (filterVehicle !== "all" && booking.vehicleId !== filterVehicle) return false;
      if (filterGuide !== "all" && booking.guideId !== filterGuide) return false;
      return true;
    });
  }, [bookings, filterStatus, filterVehicle, filterGuide]);

  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayBookings = filteredBookings.filter((booking) => {
        const bookingStart = new Date(booking.preferredDate);
        const bookingEnd = booking.endDate ? new Date(booking.endDate) : bookingStart;
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(23, 59, 59, 999);
        return date >= bookingStart && date <= bookingEnd;
      });

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        bookings: dayBookings,
      });

      if (i >= 35 && date > lastDay) break;
    }

    return days;
  }, [currentDate, filteredBookings]);

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getVehicleName = (vehicleId?: string) => {
    if (!vehicleId) return null;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})` : null;
  };

  const getGuideName = (guideId?: string) => {
    if (!guideId) return null;
    const guide = guides.find((g) => g.id === guideId);
    return guide?.name || null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="card h-[600px] animate-pulse bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (permLoading || !permAuthorized) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage bookings, vehicle and guide availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white min-w-[160px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-auto text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="input w-auto text-sm"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} - {v.brand} {v.model}
              </option>
            ))}
          </select>
          <select
            value={filterGuide}
            onChange={(e) => setFilterGuide(e.target.value)}
            className="input w-auto text-sm"
          >
            <option value="all">All Guides</option>
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Legend */}
          <div className="ml-auto flex flex-wrap items-center gap-3 text-xs">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-full ${color}`} />
                <span className="capitalize text-gray-600 dark:text-gray-400">
                  {status.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden p-0">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {DAYS.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] border-b border-r border-gray-200 dark:border-gray-700 p-1 ${
                !day.isCurrentMonth ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-800"
              } ${day.isToday ? "bg-primary-50 dark:bg-primary-900/20" : ""}`}
            >
              <div className="flex items-center justify-between px-1">
                <span
                  className={`text-sm font-medium ${
                    day.isToday
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white"
                      : day.isCurrentMonth
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {day.bookings.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {day.bookings.length} trip{day.bookings.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Bookings */}
              <div className="mt-1 space-y-1">
                {day.bookings.slice(0, 3).map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`w-full truncate rounded border px-1.5 py-0.5 text-left text-xs font-medium transition-colors hover:opacity-80 ${
                      statusBgColors[booking.status]
                    }`}
                  >
                    <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${statusColors[booking.status]}`} />
                    {booking.customerName}
                  </button>
                ))}
                {day.bookings.length > 3 && (
                  <button
                    onClick={() => setSelectedBooking(day.bookings[0])}
                    className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    +{day.bookings.length - 3} more
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Detail Sidebar */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelectedBooking(null)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-white dark:bg-gray-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                    statusBgColors[selectedBooking.status]
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusColors[selectedBooking.status]}`} />
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1).replace("-", " ")}
                </span>
              </div>

              {/* Tour Info */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedBooking.tourName}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {selectedBooking.tourType === "multi-day" ? "Multi-day Tour" : 
                   selectedBooking.tourType === "day-tour" ? "Day Tour" : "Custom Tour"}
                </p>
              </div>

              {/* Dates */}
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {new Date(selectedBooking.preferredDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {selectedBooking.endDate && (
                        <>
                          {" → "}
                          {new Date(selectedBooking.endDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Customer
                </h4>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.customerName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedBooking.customerEmail}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedBooking.customerPhone}</p>
                  {selectedBooking.customerCountry && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedBooking.customerCountry}</p>
                  )}
                </div>
              </div>

              {/* Group Size */}
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Group Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedBooking.numberOfAdults} Adult{selectedBooking.numberOfAdults > 1 ? "s" : ""}
                    {selectedBooking.numberOfChildren ? `, ${selectedBooking.numberOfChildren} Child${selectedBooking.numberOfChildren > 1 ? "ren" : ""}` : ""}
                  </p>
                </div>
              </div>

              {/* Pickup/Dropoff */}
              {(selectedBooking.pickupLocation || selectedBooking.dropoffLocation) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Locations
                  </h4>
                  {selectedBooking.pickupLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pickup</p>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedBooking.pickupLocation}</p>
                      </div>
                    </div>
                  )}
                  {selectedBooking.dropoffLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-red-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dropoff</p>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedBooking.dropoffLocation}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Resources */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Assigned Resources
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <Car className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getVehicleName(selectedBooking.vehicleId) || "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tour Guide</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getGuideName(selectedBooking.guideId) || "Not assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              {selectedBooking.totalPrice && (
                <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Price</span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {selectedBooking.currency || "USD"} {selectedBooking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  {selectedBooking.depositPaid && (
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Deposit Paid</span>
                      <span className="text-green-600 dark:text-green-400">
                        {selectedBooking.currency || "USD"} {selectedBooking.depositPaid.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`/dashboard/bookings?id=${selectedBooking.id}`}
                  className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-700"
                >
                  View Full Details
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
