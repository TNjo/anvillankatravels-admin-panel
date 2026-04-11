"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, GripVertical, Package, Pencil, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRequirePermission } from "@/lib/useRequirePermission";
import type { Tour, TourDay, PlaceToStay, Hotel, TourFAQ } from "@/types";
import ImageUpload from "@/components/ImageUpload";

export default function EditTourPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tourId = params.id as string;
  const { authorized, loading: permLoading } = useRequirePermission("tours");

  const [loading, setLoading] = useState(true);
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

  const [placesToStay, setPlacesToStay] = useState<PlaceToStay[]>([]);
  const [itinerary, setItinerary] = useState<TourDay[]>([]);
  const [subPackages, setSubPackages] = useState<Tour[]>([]);
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [faqs, setFaqs] = useState<TourFAQ[]>([]);
  const [isParentTour, setIsParentTour] = useState(false);

  useEffect(() => {
    async function fetchTour() {
      try {
        const token = await getToken();
        const res = await fetch(`/api/tours/${tourId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Not found");
        const tour: Tour = await res.json();

        setForm({
          name: tour.name || "",
          days: tour.duration?.days || 1,
          nights: tour.duration?.nights || 0,
          summary: tour.summary || "",
          route: tour.route?.length ? tour.route : [""],
          tags: tour.tags?.length ? tour.tags : [""],
          heroImage: tour.heroImage || "",
          highlights: tour.highlights?.length ? tour.highlights : [""],
          published: tour.published ?? false,
        });
        setPlacesToStay(tour.placesToStay?.length ? tour.placesToStay : [{ location: "", hotel: "", type: "" }]);
        setItinerary(
          tour.itinerary?.length
            ? tour.itinerary.map((d) => ({
                ...d,
                activities: d.activities?.length ? d.activities : [""],
              }))
            : [{ day: 1, title: "", description: "", image: "", location: "", activities: [""] }]
        );
        setFaqs(tour.faqs?.length ? tour.faqs : []);

        // Fetch sub-packages if this is a parent tour (no parentTourName)
        if (!tour.parentTourName) {
          setIsParentTour(true);
          const subRes = await fetch(`/api/tours?parentTourName=${encodeURIComponent(tour.name)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (subRes.ok) {
            setSubPackages(await subRes.json());
          }
        }

        // Fetch all tours for sub-package assignment
        const allToursRes = await fetch("/api/tours?all=true", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (allToursRes.ok) {
          setAllTours(await allToursRes.json());
        }

        // Fetch all hotels for the hotel selector
        const hotelsRes = await fetch("/api/hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (hotelsRes.ok) {
          setAllHotels(await hotelsRes.json());
        }
      } catch {
        toast.error("Failed to load tour");
        router.push("/dashboard/tours");
      } finally {
        setLoading(false);
      }
    }
    fetchTour();
  }, [tourId]);

  if (permLoading || !authorized) return null;

  // Tours available to be assigned as sub-packages (not already assigned, not this tour, no parent, has itinerary)
  const availableToursForSubPackage = allTours.filter((t) => 
    t.id !== tourId && 
    !t.parentTourName && 
    t.itinerary && 
    t.itinerary.length > 0 &&
    !subPackages.some((s) => s.id === t.id)
  );

  const handleAssignSubPackage = async (subTourId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/tours/${subTourId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parentTourName: form.name }),
      });

      if (res.ok) {
        const assignedTour = allTours.find((t) => t.id === subTourId);
        if (assignedTour) {
          setSubPackages([...subPackages, { ...assignedTour, parentTourName: form.name }]);
        }
        toast.success("Sub-package assigned successfully");
      } else {
        toast.error("Failed to assign sub-package");
      }
    } catch {
      toast.error("Failed to assign sub-package");
    }
  };

  const handleUnassignSubPackage = async (subTourId: string) => {
    if (!confirm("Remove this tour from sub-packages? The tour itself won't be deleted.")) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/tours/${subTourId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parentTourName: null }),
      });

      if (res.ok) {
        setSubPackages(subPackages.filter((s) => s.id !== subTourId));
        toast.success("Sub-package removed");
      } else {
        toast.error("Failed to remove sub-package");
      }
    } catch {
      toast.error("Failed to remove sub-package");
    }
  };

  const addArrayItem = (field: "route" | "tags" | "highlights") => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const updateArrayItem = (field: "route" | "tags" | "highlights", index: number, value: string) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const removeArrayItem = (field: "route" | "tags" | "highlights", index: number) => {
    if (form[field].length <= 1) return;
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  const updateItineraryActivity = (dayIdx: number, actIdx: number, value: string) => {
    const updated = [...itinerary];
    const activities = [...(updated[dayIdx].activities || [])];
    activities[actIdx] = value;
    updated[dayIdx] = { ...updated[dayIdx], activities };
    setItinerary(updated);
  };

  const addItineraryActivity = (dayIdx: number) => {
    const updated = [...itinerary];
    updated[dayIdx] = { ...updated[dayIdx], activities: [...(updated[dayIdx].activities || []), ""] };
    setItinerary(updated);
  };

  const removeItineraryActivity = (dayIdx: number, actIdx: number) => {
    const updated = [...itinerary];
    const activities = (updated[dayIdx].activities || []).filter((_, i) => i !== actIdx);
    updated[dayIdx] = { ...updated[dayIdx], activities: activities.length ? activities : [""] };
    setItinerary(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const tourData: Partial<Tour> = {
        name: form.name,
        duration: { days: form.days, nights: form.nights },
        summary: form.summary,
        route: form.route.filter(Boolean),
        tags: form.tags.filter(Boolean),
        heroImage: form.heroImage,
        highlights: form.highlights.filter(Boolean),
        published: form.published,
        placesToStay: placesToStay.filter((p) => p.location || p.hotel),
        itinerary: itinerary
          .filter((i) => i.title)
          .map((d) => ({ ...d, activities: (d.activities || []).filter(Boolean) })),
        faqs: faqs.filter((f) => f.question && f.answer),
      };

      const res = await fetch(`/api/tours/${tourId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      });

      if (res.ok) {
        toast.success("Tour updated successfully");
        router.push("/dashboard/tours");
      } else {
        toast.error("Failed to update tour");
      }
    } catch {
      toast.error("Failed to update tour");
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
        <button onClick={() => router.back()} className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Tour</h1>
          <p className="text-sm text-gray-500">{form.name}</p>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tour Name</label>
            <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          {!isParentTour && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Days</label>
                <input type="number" className="input" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nights</label>
                <input type="number" className="input" min={0} value={form.nights} onChange={(e) => setForm({ ...form, nights: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Summary</label>
            <textarea className="input min-h-[120px]" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required />
          </div>
          <ImageUpload
            label="Hero Image"
            value={form.heroImage}
            onChange={(url) => setForm({ ...form, heroImage: url })}
            folder="tours"
          />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
          </div>
        </div>

        {/* Sub-Packages */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Sub-Packages ({subPackages.length})</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Assign existing tour itineraries as sub-packages. These will be shown as options when users click &quot;View Packages&quot; on this tour.
          </p>
          
          {/* Existing sub-packages */}
          {subPackages.length > 0 && (
            <div className="space-y-3">
              {subPackages.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{sub.name}</h4>
                      {sub.published ? (
                        <span className="badge-success">Published</span>
                      ) : (
                        <span className="badge-neutral">Draft</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {sub.duration.days} days / {sub.duration.nights} nights &middot; {sub.route?.join(" → ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/tours/${sub.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleUnassignSubPackage(sub.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
                      title="Remove from this parent"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add sub-package selector */}
          <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/30 p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Assign Existing Tour as Sub-Package</label>
            <select
              className="input"
              value=""
              onChange={(e) => {
                if (e.target.value) handleAssignSubPackage(e.target.value);
              }}
            >
              <option value="">+ Select a tour to assign...</option>
              {availableToursForSubPackage.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.duration.days}D/{t.duration.nights}N
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Only tours without a parent and with itinerary details are shown here.
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Route</h2>
            <button type="button" onClick={() => addArrayItem("route")} className="btn-secondary text-xs"><Plus className="mr-1 h-3 w-3" /> Add Stop</button>
          </div>
          {form.route.map((stop, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex h-10 w-8 shrink-0 items-center justify-center text-xs font-medium text-gray-400">{i + 1}</span>
              <input className="input flex-1" value={stop} onChange={(e) => updateArrayItem("route", i, e.target.value)} placeholder={`Stop ${i + 1}`} />
              {form.route.length > 1 && <button type="button" onClick={() => removeArrayItem("route", i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tags</h2>
            <button type="button" onClick={() => addArrayItem("tags")} className="btn-secondary text-xs"><Plus className="mr-1 h-3 w-3" /> Add Tag</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-1">
                <input className="input w-36" value={tag} onChange={(e) => updateArrayItem("tags", i, e.target.value)} placeholder="Tag" />
                {form.tags.length > 1 && <button type="button" onClick={() => removeArrayItem("tags", i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>}
              </div>
            ))}
          </div>
        </div>

        {/* Highlights — hidden for parent tours */}
        {!isParentTour && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Highlights</h2>
              <button type="button" onClick={() => addArrayItem("highlights")} className="btn-secondary text-xs"><Plus className="mr-1 h-3 w-3" /> Add</button>
            </div>
            {form.highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1" value={h} onChange={(e) => updateArrayItem("highlights", i, e.target.value)} placeholder="Highlight" />
                {form.highlights.length > 1 && <button type="button" onClick={() => removeArrayItem("highlights", i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
          </div>
        )}

        {/* Places to Stay — hidden for parent tours */}
        {!isParentTour && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Places to Stay</h2>
              <button type="button" onClick={() => setPlacesToStay([...placesToStay, { location: "", hotel: "", type: "" }])} className="btn-secondary text-xs"><Plus className="mr-1 h-3 w-3" /> Add Place</button>
            </div>
            {placesToStay.map((place, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Hotel #{i + 1}</span>
                  {placesToStay.length > 1 && <button type="button" onClick={() => setPlacesToStay(placesToStay.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Location</label>
                    <input className="input" value={place.location} onChange={(e) => { const u = [...placesToStay]; u[i] = { ...u[i], location: e.target.value }; setPlacesToStay(u); }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Hotel Name</label>
                    <input className="input" value={place.hotel} onChange={(e) => { const u = [...placesToStay]; u[i] = { ...u[i], hotel: e.target.value }; setPlacesToStay(u); }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Type</label>
                    <input className="input" value={place.type} onChange={(e) => { const u = [...placesToStay]; u[i] = { ...u[i], type: e.target.value }; setPlacesToStay(u); }} />
                  </div>
                </div>
                <ImageUpload
                  label="Hotel Image"
                  value={place.image || ""}
                  onChange={(url) => { const u = [...placesToStay]; u[i] = { ...u[i], image: url }; setPlacesToStay(u); }}
                  folder="hotels"
                />
              </div>
            ))}
          </div>
        )}

        {/* Itinerary — hidden for parent tours */}
        {!isParentTour && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Itinerary ({itinerary.length} days)</h2>
              <button type="button" onClick={() => setItinerary([...itinerary, { day: itinerary.length + 1, title: "", description: "", image: "", location: "", activities: [""] }])} className="btn-secondary text-xs"><Plus className="mr-1 h-3 w-3" /> Add Day</button>
            </div>
            {itinerary.map((day, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-300" />
                    <h3 className="text-sm font-semibold text-primary-700">Day {day.day}</h3>
                  </div>
                  {itinerary.length > 1 && <button type="button" onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Title</label>
                    <input className="input" value={day.title} onChange={(e) => { const u = [...itinerary]; u[i] = { ...u[i], title: e.target.value }; setItinerary(u); }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Location</label>
                    <input className="input" value={day.location} onChange={(e) => { const u = [...itinerary]; u[i] = { ...u[i], location: e.target.value }; setItinerary(u); }} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Description</label>
                  <textarea className="input min-h-[80px]" value={day.description} onChange={(e) => { const u = [...itinerary]; u[i] = { ...u[i], description: e.target.value }; setItinerary(u); }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Hotels</label>
                  {/* List assigned hotels */}
                  {(day.hotelIds || (day.hotelId ? [day.hotelId] : [])).map((hId, hIdx) => {
                    const h = allHotels.find((x) => x.id === hId);
                    return (
                      <div key={hId} className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium">{h ? `${h.name} — ${h.location}` : hId}</span>
                        <Link href={`/dashboard/hotels/${hId}/edit`} className="rounded p-1 text-blue-500 hover:bg-blue-100" title="Edit hotel">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Remove hotel"
                          onClick={() => {
                            const u = [...itinerary];
                            const currentIds = u[i].hotelIds || (u[i].hotelId ? [u[i].hotelId] : []);
                            const newIds = currentIds.filter((id) => id !== hId);
                            u[i] = { ...u[i], hotelIds: newIds.length > 0 ? newIds : undefined, hotelId: newIds[0] || undefined, accommodation: newIds.length > 0 ? allHotels.find((x) => x.id === newIds[0])?.name || "" : "" };
                            setItinerary(u);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {/* Add hotel dropdown */}
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <select
                      className="input flex-1"
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const u = [...itinerary];
                        const currentIds = u[i].hotelIds || (u[i].hotelId ? [u[i].hotelId] : []);
                        if (currentIds.includes(e.target.value)) return;
                        const newIds = [...currentIds, e.target.value];
                        const firstName = allHotels.find((x) => x.id === newIds[0])?.name || "";
                        u[i] = { ...u[i], hotelIds: newIds, hotelId: newIds[0], accommodation: firstName };
                        setItinerary(u);
                      }}
                    >
                      <option value="">+ Add a hotel...</option>
                      {allHotels
                        .filter((h) => !(day.hotelIds || (day.hotelId ? [day.hotelId] : [])).includes(h.id))
                        .map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} — {h.location}
                          </option>
                        ))}
                    </select>
                  </div>
                  {!(day.hotelIds?.length || day.hotelId) && (
                    <input className="input mt-2" value={day.accommodation || ""} onChange={(e) => { const u = [...itinerary]; u[i] = { ...u[i], accommodation: e.target.value }; setItinerary(u); }} placeholder="Or type accommodation name manually" />
                  )}
                </div>
                <ImageUpload
                  label="Day Image"
                  value={day.image}
                  onChange={(url) => { const u = [...itinerary]; u[i] = { ...u[i], image: url }; setItinerary(u); }}
                  folder={`tours/${tourId}`}
                />
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs text-gray-500">Activities</label>
                    <button type="button" onClick={() => addItineraryActivity(i)} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(day.activities || [""]).map((act, ai) => (
                      <div key={ai} className="flex items-center gap-1">
                        <input className="input w-44" value={act} onChange={(e) => updateItineraryActivity(i, ai, e.target.value)} placeholder="Activity" />
                        {(day.activities || []).length > 1 && <button type="button" onClick={() => removeItineraryActivity(i, ai)} className="p-0.5 text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQs */}
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
