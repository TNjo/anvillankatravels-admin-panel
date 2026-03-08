"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ImageUpload from "@/components/ImageUpload";
import { Save, ArrowLeft, Plus, Trash2, Star, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Hotel, HotelRoomType, HotelDistance } from "@/types";

interface HotelFormProps {
  hotel?: Hotel;
}

export default function HotelForm({ hotel }: HotelFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: hotel?.name || "",
    location: hotel?.location || "",
    description: hotel?.description || "",
    heroImage: hotel?.heroImage || "",
    starRating: hotel?.starRating || 0,
    category: hotel?.category || "",
    features: hotel?.features || [""],
    mapCoordinates: hotel?.mapCoordinates || { lat: 0, lng: 0 },
  });

  const [galleryImages, setGalleryImages] = useState<string[]>(
    hotel?.galleryImages || [""]
  );

  const [roomTypes, setRoomTypes] = useState<HotelRoomType[]>(
    hotel?.roomTypes || [{ name: "", description: "", image: "" }]
  );

  const [distances, setDistances] = useState<HotelDistance[]>(
    hotel?.distances || [{ place: "", distance: "", duration: "" }]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const body = {
        name: form.name,
        location: form.location,
        description: form.description,
        heroImage: form.heroImage,
        starRating: form.starRating,
        category: form.category,
        features: form.features.filter((f) => f.trim()),
        galleryImages: galleryImages.filter((g) => g.trim()),
        roomTypes: roomTypes.filter((r) => r.name.trim()),
        distances: distances.filter((d) => d.place.trim()),
        mapCoordinates: form.mapCoordinates.lat && form.mapCoordinates.lng ? form.mapCoordinates : undefined,
      };

      const url = hotel ? `/api/hotels/${hotel.id}` : "/api/hotels";
      const method = hotel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(hotel ? "Hotel updated" : "Hotel created");
      router.push("/dashboard/hotels");
    } catch {
      toast.error("Failed to save hotel");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {hotel ? "Edit Hotel" : "Add Hotel"}
          </h1>
          <p className="text-sm text-gray-500">
            {hotel ? `Editing ${hotel.name}` : "Add a new hotel to your collection"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Hotel Name</label>
              <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Location</label>
              <input type="text" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Star Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, starRating: star === form.starRating ? 0 : star })}
                    className="p-0.5"
                  >
                    <Star className={`h-6 w-6 ${star <= form.starRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
              <input type="text" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Luxury Resort, Boutique Hotel" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea className="input min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <ImageUpload
            label="Hero Image"
            value={form.heroImage}
            onChange={(url) => setForm({ ...form, heroImage: url })}
            folder="hotels"
          />
        </div>

        {/* Gallery Images */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Gallery Images</h2>
            <button type="button" onClick={() => setGalleryImages([...galleryImages, ""])} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Image
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {galleryImages.map((img, i) => (
              <div key={i} className="relative">
                <ImageUpload
                  label={`Image ${i + 1}`}
                  value={img}
                  onChange={(url) => {
                    const updated = [...galleryImages];
                    updated[i] = url;
                    setGalleryImages(updated);
                  }}
                  folder="hotels/gallery"
                />
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Features & Amenities</h2>
            <button type="button" onClick={() => setForm({ ...form, features: [...form.features, ""] })} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  className="input w-48"
                  value={feature}
                  onChange={(e) => {
                    const updated = [...form.features];
                    updated[i] = e.target.value;
                    setForm({ ...form, features: updated });
                  }}
                  placeholder="e.g., Swimming Pool"
                />
                {form.features.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) })} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Room Types */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Room Types</h2>
            <button type="button" onClick={() => setRoomTypes([...roomTypes, { name: "", description: "", image: "" }])} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Room
            </button>
          </div>
          {roomTypes.map((room, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Room #{i + 1}</span>
                {roomTypes.length > 1 && (
                  <button type="button" onClick={() => setRoomTypes(roomTypes.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Room Name</label>
                  <input className="input" value={room.name} onChange={(e) => { const u = [...roomTypes]; u[i] = { ...u[i], name: e.target.value }; setRoomTypes(u); }} placeholder="e.g., Deluxe Room" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Description</label>
                  <input className="input" value={room.description} onChange={(e) => { const u = [...roomTypes]; u[i] = { ...u[i], description: e.target.value }; setRoomTypes(u); }} placeholder="Brief description" />
                </div>
              </div>
              <ImageUpload
                label="Room Image"
                value={room.image || ""}
                onChange={(url) => { const u = [...roomTypes]; u[i] = { ...u[i], image: url }; setRoomTypes(u); }}
                folder="hotels/rooms"
              />
            </div>
          ))}
        </div>

        {/* Distances */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Distances from Nearby Places</h2>
            <button type="button" onClick={() => setDistances([...distances, { place: "", distance: "", duration: "" }])} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Place
            </button>
          </div>
          {distances.map((dist, i) => (
            <div key={i} className="flex items-center gap-3">
              <input className="input flex-1" value={dist.place} onChange={(e) => { const u = [...distances]; u[i] = { ...u[i], place: e.target.value }; setDistances(u); }} placeholder="Place name" />
              <input className="input w-28" value={dist.distance} onChange={(e) => { const u = [...distances]; u[i] = { ...u[i], distance: e.target.value }; setDistances(u); }} placeholder="e.g., 15 km" />
              <input className="input w-28" value={dist.duration} onChange={(e) => { const u = [...distances]; u[i] = { ...u[i], duration: e.target.value }; setDistances(u); }} placeholder="e.g., 20 min" />
              {distances.length > 1 && (
                <button type="button" onClick={() => setDistances(distances.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Map Coordinates */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Map Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Latitude</label>
              <input type="number" step="any" className="input" value={form.mapCoordinates.lat || ""} onChange={(e) => setForm({ ...form, mapCoordinates: { ...form.mapCoordinates, lat: parseFloat(e.target.value) || 0 } })} placeholder="e.g., 6.9271" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Longitude</label>
              <input type="number" step="any" className="input" value={form.mapCoordinates.lng || ""} onChange={(e) => setForm({ ...form, mapCoordinates: { ...form.mapCoordinates, lng: parseFloat(e.target.value) || 0 } })} placeholder="e.g., 79.8612" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : hotel ? "Save Changes" : "Create Hotel"}
          </button>
        </div>
      </form>
    </div>
  );
}
