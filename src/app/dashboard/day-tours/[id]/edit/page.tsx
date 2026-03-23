"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useRequirePermission } from "@/lib/useRequirePermission";
import type { DayTour, DayTourItineraryStep } from "@/types";
import ImageUpload from "@/components/ImageUpload";

export default function EditDayTourPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tourId = params.id as string;
  const { authorized, loading: permLoading } = useRequirePermission("day-tours");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    summary: "",
    overview: "",
    duration: "1 Day",
    startsEnds: "",
    tourType: "Private",
    heroImage: "",
    published: false,
    highlights: [""],
    galleryImages: [""],
    inclusions: [""],
    exclusions: [""],
    tags: [""],
  });

  const [itinerary, setItinerary] = useState<DayTourItineraryStep[]>([]);

  useEffect(() => {
    async function fetchTour() {
      try {
        const token = await getToken();
        const res = await fetch(`/api/day-tours/${tourId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Not found");
        const tour: DayTour = await res.json();

        setForm({
          name: tour.name || "",
          location: tour.location || "",
          summary: tour.summary || "",
          overview: tour.overview || "",
          duration: tour.duration || "1 Day",
          startsEnds: tour.startsEnds || "",
          tourType: tour.tourType || "Private",
          heroImage: tour.heroImage || "",
          published: tour.published ?? false,
          highlights: tour.highlights?.length ? tour.highlights : [""],
          galleryImages: tour.galleryImages?.length ? tour.galleryImages : [""],
          inclusions: tour.inclusions?.length ? tour.inclusions : [""],
          exclusions: tour.exclusions?.length ? tour.exclusions : [""],
          tags: tour.tags?.length ? tour.tags : [""],
        });
        setItinerary(tour.itinerary?.length ? tour.itinerary : [{ title: "", description: "" }]);
      } catch {
        toast.error("Failed to load day tour");
        router.push("/dashboard/day-tours");
      } finally {
        setLoading(false);
      }
    }
    fetchTour();
  }, [tourId]);

  if (permLoading || !authorized) return null;

  const addArrayItem = (field: "highlights" | "galleryImages" | "inclusions" | "exclusions" | "tags") => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const updateArrayItem = (field: "highlights" | "galleryImages" | "inclusions" | "exclusions" | "tags", index: number, value: string) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const removeArrayItem = (field: "highlights" | "galleryImages" | "inclusions" | "exclusions" | "tags", index: number) => {
    if (form[field].length <= 1) return;
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const tourData: Partial<DayTour> = {
        name: form.name,
        location: form.location,
        summary: form.summary,
        overview: form.overview,
        duration: form.duration,
        startsEnds: form.startsEnds,
        tourType: form.tourType,
        heroImage: form.heroImage,
        published: form.published,
        highlights: form.highlights.filter(Boolean),
        galleryImages: form.galleryImages.filter(Boolean),
        inclusions: form.inclusions.filter(Boolean),
        exclusions: form.exclusions.filter(Boolean),
        tags: form.tags.filter(Boolean),
        itinerary: itinerary.filter((s) => s.title),
      };

      const res = await fetch(`/api/day-tours/${tourId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(tourData),
      });

      if (res.ok) {
        toast.success("Day tour updated");
        router.push("/dashboard/day-tours");
      } else {
        toast.error("Failed to update day tour");
      }
    } catch {
      toast.error("Failed to update day tour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Day Tour</h1>
          <p className="text-sm text-gray-500">{form.name}</p>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Tour Name</label>
              <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Location</label>
              <input type="text" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Summary</label>
            <textarea className="input min-h-[80px]" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Overview</label>
            <textarea className="input min-h-[120px]" value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Duration</label>
              <input type="text" className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Starts / Ends</label>
              <input type="text" className="input" value={form.startsEnds} onChange={(e) => setForm({ ...form, startsEnds: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Tour Type</label>
              <input type="text" className="input" value={form.tourType} onChange={(e) => setForm({ ...form, tourType: e.target.value })} />
            </div>
          </div>
          <ImageUpload
            label="Hero Image"
            value={form.heroImage}
            onChange={(url) => setForm({ ...form, heroImage: url })}
            folder="day-tours"
          />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
          </div>
        </div>

        {(["highlights", "tags", "inclusions", "exclusions"] as const).map((field) => (
          <div key={field} className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold capitalize">{field}</h2>
              <button type="button" onClick={() => addArrayItem(field)} className="btn-secondary text-xs"><Plus className="mr-1 h-3 w-3" /> Add</button>
            </div>
            {form[field].map((val, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1" value={val} onChange={(e) => updateArrayItem(field, i, e.target.value)} placeholder={`${field.slice(0, -1)} ${i + 1}`} />
                {form[field].length > 1 && <button type="button" onClick={() => removeArrayItem(field, i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
        ))}

        {/* Gallery Images with upload */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Gallery Images</h2>
            <button type="button" onClick={() => addArrayItem("galleryImages")} className="btn-secondary text-xs"><Plus className="mr-1 h-3 w-3" /> Add Image</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {form.galleryImages.map((val, i) => (
              <div key={i} className="relative">
                <ImageUpload
                  value={val}
                  onChange={(url) => updateArrayItem("galleryImages", i, url)}
                  folder="day-tours/gallery"
                />
                {form.galleryImages.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem("galleryImages", i)} className="absolute -right-2 -top-2 z-10 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"><Trash2 className="h-3 w-3" /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Itinerary</h2>
            <button type="button" onClick={() => setItinerary([...itinerary, { title: "", description: "" }])} className="btn-secondary text-xs"><Plus className="mr-1 h-3 w-3" /> Add Step</button>
          </div>
          {itinerary.map((step, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Step {i + 1}</span>
                {itinerary.length > 1 && <button type="button" onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
              </div>
              <input className="input" value={step.title} onChange={(e) => { const u = [...itinerary]; u[i] = { ...u[i], title: e.target.value }; setItinerary(u); }} placeholder="Step title" />
              <textarea className="input min-h-[80px]" value={step.description} onChange={(e) => { const u = [...itinerary]; u[i] = { ...u[i], description: e.target.value }; setItinerary(u); }} placeholder="Step description" />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
