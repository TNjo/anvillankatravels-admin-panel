"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Camera,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRequirePermission } from "@/lib/useRequirePermission";
import type { TravelMemory } from "@/types";

export default function TravelMemoriesPage() {
  const { getToken } = useAuth();
  const { authorized, loading: permLoading } = useRequirePermission("travel-memories");
  const [memories, setMemories] = useState<TravelMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<TravelMemory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/travel-memories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMemories(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch memories:", error);
      toast.error("Failed to load travel memories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  if (permLoading || !authorized) return null;

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/travel-memories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMemories(memories.filter((m) => m.id !== id));
        toast.success("Memory deleted successfully");
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete memory");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const togglePublished = async (memory: TravelMemory) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/travel-memories/${memory.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !memory.published }),
      });

      if (res.ok) {
        setMemories(
          memories.map((m) =>
            m.id === memory.id ? { ...m, published: !m.published } : m
          )
        );
        toast.success(memory.published ? "Memory hidden" : "Memory published");
      }
    } catch {
      toast.error("Failed to update memory");
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = memories.findIndex((m) => m.id === draggedItem);
    const targetIndex = memories.findIndex((m) => m.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newMemories = [...memories];
    const [removed] = newMemories.splice(draggedIndex, 1);
    newMemories.splice(targetIndex, 0, removed);

    setMemories(newMemories);
  };

  const handleDragEnd = async () => {
    if (!draggedItem) return;

    try {
      const token = await getToken();
      const items = memories.map((m, index) => ({ id: m.id, order: index }));

      await fetch("/api/travel-memories/reorder", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });
    } catch {
      toast.error("Failed to save order");
      fetchMemories();
    } finally {
      setDraggedItem(null);
    }
  };

  const openAddModal = () => {
    setEditingMemory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (memory: TravelMemory) => {
    setEditingMemory(memory);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<TravelMemory>) => {
    try {
      const token = await getToken();

      if (editingMemory) {
        const res = await fetch(`/api/travel-memories/${editingMemory.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const updated = await res.json();
          setMemories(
            memories.map((m) =>
              m.id === editingMemory.id ? { ...m, ...updated } : m
            )
          );
          toast.success("Memory updated successfully");
        } else {
          throw new Error("Failed to update");
        }
      } else {
        const res = await fetch("/api/travel-memories", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          const newMemory = await res.json();
          setMemories([...memories, newMemory]);
          toast.success("Memory added successfully");
        } else {
          throw new Error("Failed to create");
        }
      }

      setIsModalOpen(false);
      setEditingMemory(null);
    } catch {
      toast.error(editingMemory ? "Failed to update memory" : "Failed to add memory");
    }
  };

  const publishedCount = memories.filter((m) => m.published).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Travel Memories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your gallery of travel photos ({publishedCount} published, {memories.length - publishedCount} hidden)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Memory
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Camera className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No travel memories yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Start building your gallery by adding photos from your tours and travels.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add Your First Memory
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {memories.map((memory) => (
            <div
              key={memory.id}
              draggable
              onDragStart={() => handleDragStart(memory.id)}
              onDragOver={(e) => handleDragOver(e, memory.id)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 dark:bg-gray-800 transition-all ${
                draggedItem === memory.id
                  ? "border-primary-500 opacity-50"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              } ${!memory.published ? "opacity-60" : ""}`}
            >
              {memory.imageUrl ? (
                <img
                  src={memory.imageUrl}
                  alt={memory.title || "Travel memory"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                </div>
              )}

              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {memory.title && (
                    <p className="text-sm font-medium text-white">{memory.title}</p>
                  )}
                  {memory.location && (
                    <p className="text-xs text-gray-300">{memory.location}</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => togglePublished(memory)}
                  className={`rounded-lg p-1.5 shadow-sm transition-colors ${
                    memory.published
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  }`}
                  title={memory.published ? "Hide from gallery" : "Show in gallery"}
                >
                  {memory.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => openEditModal(memory)}
                  className="rounded-lg bg-white p-1.5 text-gray-700 shadow-sm hover:bg-gray-100"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(memory.id)}
                  className="rounded-lg bg-red-500 p-1.5 text-white shadow-sm hover:bg-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Drag handle */}
              <div className="absolute left-2 top-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-lg bg-white/90 p-1.5 shadow-sm">
                  <GripVertical className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Published badge */}
              {!memory.published && (
                <div className="absolute left-2 bottom-2">
                  <span className="rounded bg-gray-800/80 px-2 py-0.5 text-xs font-medium text-white">
                    Hidden
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Memory</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this travel memory? This action cannot be undone.
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
      <MemoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMemory(null);
        }}
        onSave={handleSave}
        memory={editingMemory}
      />
    </div>
  );
}

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TravelMemory>) => Promise<void>;
  memory: TravelMemory | null;
}

function MemoryModal({ isOpen, onClose, onSave, memory }: MemoryModalProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    location: "",
    caption: "",
    published: true,
  });

  useEffect(() => {
    if (memory) {
      setFormData({
        imageUrl: memory.imageUrl || "",
        title: memory.title || "",
        location: memory.location || "",
        caption: memory.caption || "",
        published: memory.published ?? true,
      });
    } else {
      setFormData({
        imageUrl: "",
        title: "",
        location: "",
        caption: "",
        published: true,
      });
    }
  }, [memory, isOpen]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const token = await getToken();
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "travel-memories");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
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
            {memory ? "Edit Memory" : "Add New Memory"}
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
            {/* Image Upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image *
              </label>
              {formData.imageUrl ? (
                <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      <Upload className="mr-1 inline h-3 w-3" /> Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-600"
                    >
                      <X className="mr-1 inline h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    dragOver
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="mb-2 h-10 w-10 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Click or drag image to upload
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG, WebP</span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="text"
                className="input mt-2 text-xs"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="Or paste image URL..."
              />
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input"
                placeholder="e.g., Sunset at Sigiriya"
              />
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location (optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="input"
                placeholder="e.g., Sigiriya, Sri Lanka"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Caption (optional)
              </label>
              <textarea
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                className="input min-h-[80px]"
                placeholder="A brief description of this memory..."
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, published: !formData.published })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  formData.published ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    formData.published ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {formData.published ? "Visible in gallery" : "Hidden from gallery"}
              </span>
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={loading || uploading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {memory ? "Update Memory" : "Add Memory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
