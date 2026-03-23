"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  UserCircle,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Phone,
  Mail,
  Languages,
  Star,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRequirePermission } from "@/lib/useRequirePermission";
import type { TourGuide } from "@/types";

const STATUS_OPTIONS = ["available", "on-trip", "unavailable"] as const;

const LANGUAGE_OPTIONS = [
  "English",
  "Sinhala",
  "Tamil",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Chinese",
  "Japanese",
  "Russian",
];

const SPECIALIZATION_OPTIONS = [
  "Wildlife",
  "History",
  "Culture",
  "Adventure",
  "Photography",
  "Hiking",
  "Beach",
  "Ayurveda",
  "Food & Cuisine",
  "Architecture",
];

const statusBadge: Record<string, string> = {
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "on-trip": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  unavailable: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export default function TourGuidesPage() {
  const { getToken } = useAuth();
  const { authorized, loading: permLoading } = useRequirePermission("tour-guides");
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<TourGuide | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const url = filterStatus !== "all"
        ? `/api/tour-guides?status=${filterStatus}`
        : "/api/tour-guides";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setGuides(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch tour guides:", error);
      toast.error("Failed to load tour guides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [filterStatus]);

  if (permLoading || !authorized) return null;

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/tour-guides/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setGuides(guides.filter((g) => g.id !== id));
        toast.success("Tour guide deleted successfully");
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete tour guide");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSave = async (data: Partial<TourGuide>) => {
    try {
      const token = await getToken();

      if (editingGuide) {
        const res = await fetch(`/api/tour-guides/${editingGuide.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const updated = await res.json();
          setGuides(
            guides.map((g) =>
              g.id === editingGuide.id ? { ...g, ...updated } : g
            )
          );
          toast.success("Tour guide updated successfully");
        } else {
          throw new Error("Failed to update");
        }
      } else {
        const res = await fetch("/api/tour-guides", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const newGuide = await res.json();
          setGuides([newGuide, ...guides]);
          toast.success("Tour guide added successfully");
        } else {
          throw new Error("Failed to create");
        }
      }

      setIsModalOpen(false);
      setEditingGuide(null);
    } catch {
      toast.error(editingGuide ? "Failed to update tour guide" : "Failed to add tour guide");
    }
  };

  const openAddModal = () => {
    setEditingGuide(null);
    setIsModalOpen(true);
  };

  const openEditModal = (guide: TourGuide) => {
    setEditingGuide(guide);
    setIsModalOpen(true);
  };

  const filteredGuides = guides.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.name?.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.phone?.toLowerCase().includes(q) ||
      g.languages?.some((l) => l.toLowerCase().includes(q))
    );
  });

  const availableCount = guides.filter((g) => g.status === "available").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Guides</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your tour guides ({availableCount} available, {guides.length} total)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Tour Guide
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, language..."
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
      ) : filteredGuides.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <UserCircle className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tour guides found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || filterStatus !== "all"
              ? "Try adjusting your search or filter"
              : "Add your first tour guide to get started"}
          </p>
          {!search && filterStatus === "all" && (
            <button
              onClick={openAddModal}
              className="mt-4 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Tour Guide
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <div key={guide.id} className="card">
              <div className="flex items-start gap-3">
                {guide.imageUrl ? (
                  <img
                    src={guide.imageUrl}
                    alt={guide.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <UserCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{guide.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[guide.status]}`}>
                      {guide.status.charAt(0).toUpperCase() + guide.status.slice(1).replace("-", " ")}
                    </span>
                  </div>
                  {guide.rating && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{guide.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{guide.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{guide.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Languages className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{guide.languages?.join(", ")}</span>
                </div>
              </div>

              {guide.specializations && guide.specializations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {guide.specializations.slice(0, 3).map((spec) => (
                    <span
                      key={spec}
                      className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
                    >
                      {spec}
                    </span>
                  ))}
                  {guide.specializations.length > 3 && (
                    <span className="text-xs text-gray-400">+{guide.specializations.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                <button
                  onClick={() => openEditModal(guide)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(guide.id)}
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Tour Guide</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this tour guide? This action cannot be undone.
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
      <GuideModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGuide(null);
        }}
        onSave={handleSave}
        guide={editingGuide}
      />
    </div>
  );
}

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TourGuide>) => Promise<void>;
  guide: TourGuide | null;
}

function GuideModal({ isOpen, onClose, onSave, guide }: GuideModalProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    languages: ["English"] as string[],
    specializations: [] as string[],
    experience: "",
    bio: "",
    imageUrl: "",
    licenseNumber: "",
    status: "available" as TourGuide["status"],
    rating: "",
    notes: "",
  });

  useEffect(() => {
    if (guide) {
      setFormData({
        name: guide.name || "",
        email: guide.email || "",
        phone: guide.phone || "",
        languages: guide.languages || ["English"],
        specializations: guide.specializations || [],
        experience: guide.experience?.toString() || "",
        bio: guide.bio || "",
        imageUrl: guide.imageUrl || "",
        licenseNumber: guide.licenseNumber || "",
        status: guide.status || "available",
        rating: guide.rating?.toString() || "",
        notes: guide.notes || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        languages: ["English"],
        specializations: [],
        experience: "",
        bio: "",
        imageUrl: "",
        licenseNumber: "",
        status: "available",
        rating: "",
        notes: "",
      });
    }
  }, [guide, isOpen]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const token = await getToken();
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "tour-guides");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Photo uploaded successfully");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        languages: formData.languages,
        specializations: formData.specializations,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
        bio: formData.bio || undefined,
        imageUrl: formData.imageUrl || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        status: formData.status,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        notes: formData.notes || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {guide ? "Edit Tour Guide" : "Add New Tour Guide"}
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
            {/* Profile Photo */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Photo
              </label>
              <div className="flex items-start gap-4">
                {formData.imageUrl ? (
                  <div className="group relative">
                    <img
                      src={formData.imageUrl}
                      alt="Tour Guide"
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-white p-1.5 text-gray-700 shadow-sm hover:bg-gray-50"
                        title="Replace"
                      >
                        <Upload className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="rounded-full bg-red-500 p-1.5 text-white shadow-sm hover:bg-red-600"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                )}
                <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Upload a profile photo</p>
                  <p className="text-xs">JPG, PNG, or WebP. Recommended: 200x200px</p>
                  {!formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3" /> Choose Photo
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="+94 77 123 4567"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Languages *
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      formData.languages.includes(lang)
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATION_OPTIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      formData.specializations.includes(spec)
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="input"
                  placeholder="5"
                  min="0"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="input"
                  placeholder="TG-12345"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Brief introduction about the guide..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TourGuide["status"] })}
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
                className="input min-h-[60px]"
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
              {guide ? "Update Guide" : "Add Guide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
