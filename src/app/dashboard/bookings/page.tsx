"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  CalendarCheck,
  Search,
  ChevronDown,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRequirePermission } from "@/lib/useRequirePermission";
import type { Booking, Tour, DayTour, Vehicle, TourGuide } from "@/types";
import BookingModal from "@/components/BookingModal";
import BookingDetailModal from "@/components/BookingDetailModal";

const STATUS_OPTIONS = ["pending", "confirmed", "in-progress", "completed", "cancelled"] as const;

const statusBadge: Record<string, string> = {
  pending: "badge-warning",
  confirmed: "badge-success",
  "in-progress": "badge-info",
  completed: "badge-neutral",
  cancelled: "badge-danger",
};

const paymentBadge: Record<string, string> = {
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "deposit-paid": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "fully-paid": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export default function BookingsPage() {
  const { getToken } = useAuth();
  const { authorized, loading: permLoading } = useRequirePermission("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [dayTours, setDayTours] = useState<DayTour[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchBookings = async (status?: string) => {
    setLoading(true);
    try {
      const token = await getToken();
      const url =
        status && status !== "all"
          ? `/api/bookings?status=${status}`
          : "/api/bookings";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const token = await getToken();
      const [toursRes, dayToursRes] = await Promise.all([
        fetch("/api/tours?all=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/day-tours", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (toursRes.ok) {
        setTours(await toursRes.json());
      }
      if (dayToursRes.ok) {
        setDayTours(await dayToursRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch tours:", error);
    }
  };

  const fetchVehiclesAndGuides = async () => {
    try {
      const token = await getToken();
      const [vehiclesRes, guidesRes] = await Promise.all([
        fetch("/api/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/tour-guides", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (vehiclesRes.ok) {
        setVehicles(await vehiclesRes.json());
      }
      if (guidesRes.ok) {
        setGuides(await guidesRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch vehicles/guides:", error);
    }
  };

  useEffect(() => {
    fetchBookings(filterStatus);
    fetchTours();
    fetchVehiclesAndGuides();
  }, [filterStatus]);

  if (permLoading || !authorized) return null;

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        if (filterStatus !== "all" && status !== filterStatus) {
          setBookings(bookings.filter((b) => b.id !== id));
        } else {
          setBookings(
            bookings.map((b) =>
              b.id === id ? { ...b, status: status as Booking["status"] } : b
            )
          );
        }
        toast.success(`Booking ${status}`);
      }
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const handleSaveBooking = async (bookingData: Partial<Booking>) => {
    try {
      const token = await getToken();

      if (selectedBooking) {
        const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        if (res.ok) {
          const updated = await res.json();
          setBookings(
            bookings.map((b) =>
              b.id === selectedBooking.id ? { ...b, ...updated } : b
            )
          );
          toast.success("Booking updated successfully");
        } else {
          throw new Error("Failed to update");
        }
      } else {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        });

        if (res.ok) {
          const newBooking = await res.json();
          setBookings([newBooking, ...bookings]);
          toast.success("Booking created successfully");
        } else {
          throw new Error("Failed to create");
        }
      }
    } catch {
      toast.error(
        selectedBooking ? "Failed to update booking" : "Failed to create booking"
      );
      throw new Error("Save failed");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setBookings(bookings.filter((b) => b.id !== id));
        toast.success("Booking deleted successfully");
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete booking");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openAddModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const filteredBookings = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.customerName?.toLowerCase().includes(q) ||
      b.tourName?.toLowerCase().includes(q) ||
      b.customerEmail?.toLowerCase().includes(q) ||
      b.customerPhone?.toLowerCase().includes(q)
    );
  });

  const getTotalGuests = (booking: Booking) => {
    return (booking.numberOfAdults || 0) + (booking.numberOfChildren || 0);
  };

  const formatCurrency = (amount: number | undefined, currency: string | undefined) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage tour bookings and reservations
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Booking
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input appearance-none pr-10"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="card animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <CalendarCheck className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || filterStatus !== "all"
              ? "Try adjusting your search or filter"
              : "Click 'Add Booking' to create your first booking"}
          </p>
          {!search && filterStatus === "all" && (
            <button
              onClick={openAddModal}
              className="mt-4 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Booking
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tour
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Guests
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{booking.customerEmail}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{booking.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{booking.tourName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {booking.tourType === "multi-day"
                          ? "Multi-Day"
                          : booking.tourType === "day-tour"
                          ? "Day Tour"
                          : "Custom"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {booking.preferredDate
                          ? formatDate(booking.preferredDate)
                          : "—"}
                      </p>
                      {booking.endDate && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          to {formatDate(booking.endDate)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {getTotalGuests(booking)} total
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {booking.numberOfAdults || 0} adults
                        {(booking.numberOfChildren || 0) > 0 &&
                          `, ${booking.numberOfChildren} children`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(booking.totalPrice, booking.currency)}
                      </p>
                      {booking.paymentStatus && (
                        <span
                          className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                            paymentBadge[booking.paymentStatus] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.paymentStatus
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={booking.status}
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
                        className={`rounded border px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                          statusBadge[booking.status] || "badge-neutral"
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s
                              .split("-")
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(" ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetailModal(booking)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(booking)}
                          className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30 transition-colors"
                          title="Edit Booking"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(booking.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete Booking"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Booking</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this booking? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBooking(deleteConfirmId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal for Add/Edit */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        onSave={handleSaveBooking}
        booking={selectedBooking}
        tours={tours}
        dayTours={dayTours}
        vehicles={vehicles}
        guides={guides}
      />

      {/* Booking Detail Modal */}
      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </div>
  );
}
