"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tour, TourDay, PlaceToStay, TourFAQ } from "@/types";
import ImageUpload from "@/components/ImageUpload";

export default function NewTourPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    days: 1,
    nights: 0,
    summary: "",
    route: [""],
    tags: [""],
    heroImage: "",
    highlights: [""],
    published: false,
  });

  const [placesToStay, setPlacesToStay] = useState<PlaceToStay[]>([
    { location: "", hotel: "", type: "" },
  ]);

  const [itinerary, setItinerary] = useState<TourDay[]>([
    { day: 1, title: "", description: "", image: "", location: "", activities: [""], accommodation: "" },
  ]);

  const [faqs, setFaqs] = useState<TourFAQ[]>([]);

  const addArrayItem = (field: "route" | "tags" | "highlights") => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const updateArrayItem = (field: "route" | "tags" | "highlights", index: number, value: string) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const removeArrayItem = (field: "route" | "tags" | "highlights", index: number) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const tourData: Omit<Tour, "id"> = {
        name: form.name,
        duration: { days: form.days, nights: form.nights },
        summary: form.summary,
        route: form.route.filter(Boolean),
        tags: form.tags.filter(Boolean),
        heroImage: form.heroImage,
        highlights: form.highlights.filter(Boolean),
        published: form.published,
        placesToStay: placesToStay.filter((p) => p.location && p.hotel),
        itinerary: itinerary.filter((i) => i.title),
        faqs: faqs.filter((f) => f.question && f.answer),
      };

      const res = await fetch("/api/tours", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      });

      if (res.ok) {
        toast.success("Tour created successfully");
        router.push("/dashboard/tours");
      } else {
        toast.error("Failed to create tour");
      }
    } catch {
      toast.error("Failed to create tour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Tour</h1>
          <p className="text-sm text-gray-500">Create a new multi-day tour package</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tour Name</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Luxury Classic Sri Lanka"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Days</label>
              <input
                type="number"
                className="input"
                min={1}
                value={form.days}
                onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nights</label>
              <input
                type="number"
                className="input"
                min={0}
                value={form.nights}
                onChange={(e) => setForm({ ...form, nights: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              className="input min-h-[100px]"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Describe the tour..."
              required
            />
          </div>

          <ImageUpload
            label="Hero Image"
            value={form.heroImage}
            onChange={(url) => setForm({ ...form, heroImage: url })}
            folder="tours"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Publish immediately
            </label>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Route</h2>
            <button type="button" onClick={() => addArrayItem("route")} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Stop
            </button>
          </div>
          {form.route.map((stop, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                value={stop}
                onChange={(e) => updateArrayItem("route", i, e.target.value)}
                placeholder={`Stop ${i + 1}`}
              />
              {form.route.length > 1 && (
                <button type="button" onClick={() => removeArrayItem("route", i)} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tags</h2>
            <button type="button" onClick={() => addArrayItem("tags")} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  className="input w-32"
                  value={tag}
                  onChange={(e) => updateArrayItem("tags", i, e.target.value)}
                  placeholder="Tag"
                />
                {form.tags.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem("tags", i)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Highlights</h2>
            <button type="button" onClick={() => addArrayItem("highlights")} className="btn-secondary text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Highlight
            </button>
          </div>
          {form.highlights.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                value={h}
                onChange={(e) => updateArrayItem("highlights", i, e.target.value)}
                placeholder="Highlight"
              />
              {form.highlights.length > 1 && (
                <button type="button" onClick={() => removeArrayItem("highlights", i)} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Places to Stay</h2>
            <button
              type="button"
              onClick={() => setPlacesToStay([...placesToStay, { location: "", hotel: "", type: "" }])}
              className="btn-secondary text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Place
            </button>
          </div>
          {placesToStay.map((place, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 rounded-lg border border-gray-200 p-3">
              <input
                className="input"
                value={place.location}
                onChange={(e) => {
                  const updated = [...placesToStay];
                  updated[i] = { ...updated[i], location: e.target.value };
                  setPlacesToStay(updated);
                }}
                placeholder="Location"
              />
              <input
                className="input"
                value={place.hotel}
                onChange={(e) => {
                  const updated = [...placesToStay];
                  updated[i] = { ...updated[i], hotel: e.target.value };
                  setPlacesToStay(updated);
                }}
                placeholder="Hotel name"
              />
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  value={place.type}
                  onChange={(e) => {
                    const updated = [...placesToStay];
                    updated[i] = { ...updated[i], type: e.target.value };
                    setPlacesToStay(updated);
                  }}
                  placeholder="Type"
                />
                {placesToStay.length > 1 && (
                  <button type="button" onClick={() => setPlacesToStay(placesToStay.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Itinerary</h2>
            <button
              type="button"
              onClick={() =>
                setItinerary([
                  ...itinerary,
                  { day: itinerary.length + 1, title: "", description: "", image: "", location: "", activities: [""], accommodation: "" },
                ])
              }
              className="btn-secondary text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Day
            </button>
          </div>
          {itinerary.map((day, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Day {day.day}</h3>
                {itinerary.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input"
                  value={day.title}
                  onChange={(e) => {
                    const updated = [...itinerary];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setItinerary(updated);
                  }}
                  placeholder="Day title"
                />
                <input
                  className="input"
                  value={day.location}
                  onChange={(e) => {
                    const updated = [...itinerary];
                    updated[i] = { ...updated[i], location: e.target.value };
                    setItinerary(updated);
                  }}
                  placeholder="Location"
                />
              </div>
              <textarea
                className="input min-h-[80px]"
                value={day.description}
                onChange={(e) => {
                  const updated = [...itinerary];
                  updated[i] = { ...updated[i], description: e.target.value };
                  setItinerary(updated);
                }}
                placeholder="Day description"
              />
              <input
                className="input"
                value={day.accommodation || ""}
                onChange={(e) => {
                  const updated = [...itinerary];
                  updated[i] = { ...updated[i], accommodation: e.target.value };
                  setItinerary(updated);
                }}
                placeholder="Accommodation"
              />
            </div>
          ))}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">FAQs</h2>
            <button
              type="button"
              onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
              className="btn-secondary text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> Add FAQ
            </button>
          </div>
          {faqs.length === 0 && (
            <p className="text-sm text-gray-400">No FAQs added yet. Click &quot;Add FAQ&quot; to get started.</p>
          )}
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">FAQ #{i + 1}</span>
                <button
                  type="button"
                  onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Question</label>
                <input
                  className="input"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[i] = { ...updated[i], question: e.target.value };
                    setFaqs(updated);
                  }}
                  placeholder="e.g., What is included in this tour?"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Answer</label>
                <textarea
                  className="input min-h-[80px]"
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[i] = { ...updated[i], answer: e.target.value };
                    setFaqs(updated);
                  }}
                  placeholder="Provide a detailed answer..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Create Tour"}
          </button>
        </div>
      </form>
    </div>
  );
}
