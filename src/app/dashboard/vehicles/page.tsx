"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { Vehicle } from "@/types";

const VEHICLE_TYPES = ["car", "van", "mini-bus", "bus", "suv", "luxury"] as const;
const STATUS_OPTIONS = ["available", "on-trip", "maintenance", "retired"] as const;

const statusBadge: Record<string, string> = {
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "on-trip": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  maintenance: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  retired: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const typeLabels: Record<string, string> = {
  car: "Car",
  van: "Van",
  "mini-bus": "Mini Bus",
  bus: "Bus",
  suv: "SUV",
  luxury: "Luxury",
};

export default function VehiclesPage() {
  const { getToken } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const url = filterStatus !== "all" 
        ? `/api/vehicles?status=${filterStatus}` 
        : "/api/vehicles";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setVehicles(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterStatus]);

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setVehicles(vehicles.filter((v) => v.id !== id));
        toast.success("Vehicle deleted successfully");
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete vehicle");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSave = async (data: Partial<Vehicle>) => {
    try {
      const token = await getToken();

      if (editingVehicle) {
        const res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const updated = await res.json();
          setVehicles(
            vehicles.map((v) =>
              v.id === editingVehicle.id ? { ...v, ...updated } : v
            )
          );
          toast.success("Vehicle updated successfully");
        } else {
          throw new Error("Failed to update");
        }
      } else {
        const res = await fetch("/api/vehicles", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const newVehicle = await res.json();
          setVehicles([newVehicle, ...vehicles]);
          toast.success("Vehicle added successfully");
        } else {
          throw new Error("Failed to create");
        }
      }

      setIsModalOpen(false);
      setEditingVehicle(null);
    } catch {
      toast.error(editingVehicle ? "Failed to update vehicle" : "Failed to add vehicle");
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.registrationNumber?.toLowerCase().includes(q) ||
      v.brand?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q)
    );
  });

  const availableCount = vehicles.filter((v) => v.status === "available").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicles</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your fleet ({availableCount} available, {vehicles.length} total)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by registration, brand, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-auto"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Car className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No vehicles found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || filterStatus !== "all"
              ? "Try adjusting your search or filter"
              : "Add your first vehicle to get started"}
          </p>
          {!search && filterStatus === "all" && (
            <button
              onClick={openAddModal}
              className="mt-4 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Vehicle
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.registrationNumber}
                    </h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[vehicle.status]}`}>
                      {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1).replace("-", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {vehicle.brand} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Car className="h-3.5 w-3.5" />
                      {typeLabels[vehicle.type] || vehicle.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {vehicle.capacity} seats
                    </span>
                  </div>
                  {vehicle.color && (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Color: {vehicle.color}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                <button
                  onClick={() => openEditModal(vehicle)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(vehicle.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Vehicle</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVehicle(null);
        }}
        onSave={handleSave}
        vehicle={editingVehicle}
      />
    </div>
  );
}

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Vehicle>) => Promise<void>;
  vehicle: Vehicle | null;
}

function VehicleModal({ isOpen, onClose, onSave, vehicle }: VehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: "",
    type: "car" as Vehicle["type"],
    brand: "",
    model: "",
    year: "",
    capacity: "4",
    color: "",
    features: "",
    imageUrl: "",
    status: "available" as Vehicle["status"],
    notes: "",
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        registrationNumber: vehicle.registrationNumber || "",
        type: vehicle.type || "car",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year?.toString() || "",
        capacity: vehicle.capacity?.toString() || "4",
        color: vehicle.color || "",
        features: vehicle.features?.join(", ") || "",
        imageUrl: vehicle.imageUrl || "",
        status: vehicle.status || "available",
        notes: vehicle.notes || "",
      });
    } else {
      setFormData({
        registrationNumber: "",
        type: "car",
        brand: "",
        model: "",
        year: "",
        capacity: "4",
        color: "",
        features: "",
        imageUrl: "",
        status: "available",
        notes: "",
      });
    }
  }, [vehicle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        registrationNumber: formData.registrationNumber,
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        capacity: parseInt(formData.capacity) || 4,
        color: formData.color || undefined,
        features: formData.features ? formData.features.split(",").map((f) => f.trim()).filter(Boolean) : [],
        imageUrl: formData.imageUrl || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {vehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="input"
                  placeholder="e.g., ABC-1234"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vehicle Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Vehicle["type"] })}
                  className="input"
                  required
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {typeLabels[type] || type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="input"
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="input"
                  placeholder="e.g., Hiace"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="input"
                  placeholder="2023"
                  min="1990"
                  max="2030"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="input"
                  placeholder="4"
                  min="1"
                  max="50"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input"
                  placeholder="White"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Features (comma separated)
              </label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="input"
                placeholder="AC, WiFi, GPS, Leather Seats"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Vehicle["status"] })}
                className="input"
                required
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
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
              {vehicle ? "Update Vehicle" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
