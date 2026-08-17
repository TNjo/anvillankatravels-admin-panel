"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ImageUpload from "@/components/ImageUpload";
import { Save, ArrowLeft, Plus, Trash2, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Location, LocationAttraction, LocationOpeningHours } from "@/types";

interface LocationFormProps {
  location?: Location;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CATEGORIES = [
  { value: "cultural", label: "Cultural" },
  { value: "natural", label: "Natural" },
  { value: "beach", label: "Beach" },
  { value: "wildlife", label: "Wildlife" },
  { value: "adventure", label: "Adventure" },
  { value: "historical", label: "Historical" },
  { value: "religious", label: "Religious" },
];

export default function LocationForm({ location }: LocationFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: location?.name || "",
    briefDescription: location?.briefDescription || "",
    description: location?.description || "",
    heroImage: location?.heroImage || "",
    category: location?.category || "cultural",
    dressCode: location?.dressCode || "",
    bestTimeToVisit: location?.bestTimeToVisit || "",
    accessibility: location?.accessibility || "",
    averageVisitDuration: location?.averageVisitDuration || "",
    published: location?.published ?? false,
    mapCoordinates: location?.mapCoordinates || { lat: 0, lng: 0 },
    entranceFee: location?.entranceFee || { local: "", foreign: "", children: "" },
  });

  const [galleryImages, setGalleryImages] = useState<string[]>(
    location?.galleryImages || [""]
  );

  const [attractions, setAttractions] = useState<LocationAttraction[]>(
    location?.attractions || [{ name: "", description: "", distance: "", duration: "", image: "" }]
  );

  const [openingHours, setOpeningHours] = useState<LocationOpeningHours[]>(
    location?.openingHours || DAYS_OF_WEEK.map((day) => ({ day, openTime: "08:00", closeTime: "17:00", isClosed: false }))
  );

  const [tips, setTips] = useState<string[]>(location?.tips || [""]);
  const [facilities, setFacilities] = useState<string[]>(location?.facilities || [""]);
  const [tags, setTags] = useState<string[]>(location?.tags || [""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const body = {
        name: form.name,
        briefDescription: form.briefDescription,
        description: form.description,
        heroImage: form.heroImage,
        category: form.category,
        dressCode: form.dressCode || undefined,
        bestTimeToVisit: form.bestTimeToVisit || undefined,
        accessibility: form.accessibility || undefined,
        averageVisitDuration: form.averageVisitDuration || undefined,
        published: form.published,
        mapCoordinates: form.mapCoordinates.lat && form.mapCoordinates.lng ? form.mapCoordinates : undefined,
        entranceFee: (form.entranceFee.local || form.entranceFee.foreign || form.entranceFee.children) ? form.entranceFee : undefined,
        galleryImages: galleryImages.filter((g) => g.trim()),
        attractions: attractions.filter((a) => a.name.trim()),
        openingHours: openingHours,
        tips: tips.filter((t) => t.trim()),
        facilities: facilities.filter((f) => f.trim()),
        tags: tags.filter((t) => t.trim()),
      };

      const url = location ? `/api/locations/${location.id}` : "/api/locations";
      const method = location ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(location ? "Location updated" : "Location created");
      router.push("/dashboard/locations");
    } catch {
      toast.error("Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {location ? "Edit Location" : "Add Location"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {location ? `Editing ${location.name}` : "Add a new destination to the map"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Location Name</label>
              <input 
                type="text" 
                className="input" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="e.g., Sigiriya Rock Fortress"
                required 
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select 
                className="input" 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value as Location["category"] })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Brief Description</label>
            <input 
              type="text" 
              className="input" 
              value={form.briefDescription} 
              onChange={(e) => setForm({ ...form, briefDescription: e.target.value })} 
              placeholder="Short description for cards and previews (1-2 sentences)"
              required 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Description</label>
            <textarea 
              className="input min-h-[150px]" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              placeholder="Detailed description of the location, its history, significance, and what visitors can expect..."
              required 
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Publish this location (visible on frontend)
            </label>
          </div>
          <ImageUpload
            label="Hero Image"
            value={form.heroImage}
            onChange={(url) => setForm({ ...form, heroImage: url })}
            folder="locations"
          />
        </div>

        {/* Gallery Images */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gallery Images</h2>
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
                  folder="locations/gallery"
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

        {/* Map Coordinates */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Map Location
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
              <input 
                type="number" 
                step="any" 
                className="input" 
                value={form.mapCoordinates.lat || ""} 
                onChange={(e) => setForm({ ...form, mapCoordinates: { ...form.mapCoordinates, lat: parseFloat(e.target.value) || 0 } })} 
                placeholder="e.g., 7.9570" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
              <input 
                type="number" 
                step="any" 
                className="input" 
                value={form.mapCoordinates.lng || ""} 
                onChange={(e) => setForm({ ...form, mapCoordinates: { ...form.mapCoordinates, lng: parseFloat(e.target.value) || 0 } })} 
                placeholder="e.g., 80.7603" 
              />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5" /> Opening Hours
          </h2>
          <div className="space-y-3">
            {openingHours.map((hours, i) => (
              <div key={hours.day} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">{hours.day}</span>
                <label className="flex items-center gap-2 text-sm text-gray-500">
                  <input
                    type="checkbox"
                    checked={hours.isClosed}
                    onChange={(e) => {
                      const updated = [...openingHours];
                      updated[i] = { ...updated[i], isClosed: e.target.checked };
                      setOpeningHours(updated);
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Closed
                </label>
                {!hours.isClosed && (
                  <>
                    <input
                      type="time"
                      className="input w-32"
                      value={hours.openTime}
                      onChange={(e) => {
                        const updated = [...openingHours];
                        updated[i] = { ...updated[i], openTime: e.target.value };
                        setOpeningHours(updated);
                      }}
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      className="input w-32"
                      value={hours.closeTime}
                      onChange={(e) => {
                        const updated = [...openingHours];
                        updated[i] = { ...updated[i], closeTime: e.target.value };
                        setOpeningHours(updated);
                      }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Entrance Fees */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Entrance Fees</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Local Visitors</label>
              <input 
                type="text" 
                className="input" 
                value={form.entranceFee.local} 
                onChange={(e) => setForm({ ...form, entranceFee: { ...form.entranceFee, local: e.target.value } })} 
                placeholder="e.g., LKR 50" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Foreign Visitors</label>
              <input 
                type="text" 
                className="input" 
                value={form.entranceFee.foreign} 
                onChange={(e) => setForm({ ...form, entranceFee: { ...form.entranceFee, foreign: e.target.value } })} 
                placeholder="e.g., USD 30" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Children</label>
              <input 
                type="text" 
                className="input" 
                value={form.entranceFee.children} 
                onChange={(e) => setForm({ ...form, entranceFee: { ...form.entranceFee, children: e.target.value } })} 
                placeholder="e.g., Half price" 
              />
            </div>
          </div>
        </div>

        {/* Nearby Attractions */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nearby Attractions</h2>
            <button 
              type="button" 
              onClick={() => setAttractions([...attractions, { name: "", description: "", distance: "", duration: "", image: "" }])} 
              className="btn-secondary text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Attraction
            </button>
          </div>
          {attractions.map((attraction, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Attraction #{i + 1}</span>
                {attractions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setAttractions(attractions.filter((_, idx) => idx !== i))} 
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Name</label>
                  <input 
                    className="input" 
                    value={attraction.name} 
                    onChange={(e) => { const u = [...attractions]; u[i] = { ...u[i], name: e.target.value }; setAttractions(u); }} 
                    placeholder="e.g., Pidurangala Rock" 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Distance</label>
                  <input 
                    className="input" 
                    value={attraction.distance} 
                    onChange={(e) => { const u = [...attractions]; u[i] = { ...u[i], distance: e.target.value }; setAttractions(u); }} 
                    placeholder="e.g., 2 km" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Travel Duration</label>
                  <input 
                    className="input" 
                    value={attraction.duration} 
                    onChange={(e) => { const u = [...attractions]; u[i] = { ...u[i], duration: e.target.value }; setAttractions(u); }} 
                    placeholder="e.g., 10 min by car" 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Description</label>
                  <input 
                    className="input" 
                    value={attraction.description} 
                    onChange={(e) => { const u = [...attractions]; u[i] = { ...u[i], description: e.target.value }; setAttractions(u); }} 
                    placeholder="Brief description" 
                  />
                </div>
              </div>
              <ImageUpload
                label="Attraction Image"
                value={attraction.image || ""}
                onChange={(url) => { const u = [...attractions]; u[i] = { ...u[i], image: url }; setAttractions(u); }}
                folder="locations/attractions"
              />
            </div>
          ))}
        </div>

        {/* Dress Code */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dress Code</h2>
          <textarea 
            className="input min-h-[100px]" 
            value={form.dressCode} 
            onChange={(e) => setForm({ ...form, dressCode: e.target.value })} 
            placeholder="Describe any dress code requirements (e.g., cover shoulders and knees for religious sites, comfortable walking shoes for hiking, etc.)"
          />
        </div>

        {/* Additional Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Best Time to Visit</label>
              <input 
                type="text" 
                className="input" 
                value={form.bestTimeToVisit} 
                onChange={(e) => setForm({ ...form, bestTimeToVisit: e.target.value })} 
                placeholder="e.g., Early morning for sunrise" 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Average Visit Duration</label>
              <input 
                type="text" 
                className="input" 
                value={form.averageVisitDuration} 
                onChange={(e) => setForm({ ...form, averageVisitDuration: e.target.value })} 
                placeholder="e.g., 2-3 hours" 
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Accessibility</label>
            <textarea 
              className="input min-h-[80px]" 
              value={form.accessibility} 
              onChange={(e) => setForm({ ...form, accessibility: e.target.value })} 
              placeholder="Describe accessibility features or limitations (wheelchair access, steep stairs, etc.)"
            />
          </div>
        </div>

        {/* Facilities */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Facilities</h2>
            <button type="button" onClick={() => setFacilities([...facilities, ""])} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  className="input w-48"
                  value={facility}
                  onChange={(e) => {
                    const updated = [...facilities];
                    updated[i] = e.target.value;
                    setFacilities(updated);
                  }}
                  placeholder="e.g., Restrooms"
                />
                {facilities.length > 1 && (
                  <button type="button" onClick={() => setFacilities(facilities.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Travel Tips */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Travel Tips</h2>
            <button type="button" onClick={() => setTips([...tips, ""])} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Tip
            </button>
          </div>
          {tips.map((tip, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="input flex-1"
                value={tip}
                onChange={(e) => {
                  const updated = [...tips];
                  updated[i] = e.target.value;
                  setTips(updated);
                }}
                placeholder="e.g., Bring plenty of water and sunscreen"
              />
              {tips.length > 1 && (
                <button type="button" onClick={() => setTips(tips.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h2>
            <button type="button" onClick={() => setTags([...tags, ""])} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  className="input w-40"
                  value={tag}
                  onChange={(e) => {
                    const updated = [...tags];
                    updated[i] = e.target.value;
                    setTags(updated);
                  }}
                  placeholder="e.g., UNESCO"
                />
                {tags.length > 1 && (
                  <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : location ? "Save Changes" : "Create Location"}
          </button>
        </div>
      </form>
    </div>
  );
}
