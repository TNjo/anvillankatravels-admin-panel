"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Sun } from "lucide-react";
import { toast } from "sonner";
import type { DayTour } from "@/types";

export default function DayToursPage() {
  const { getToken } = useAuth();
  const [tours, setTours] = useState<DayTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const fetchDayTours = useCallback(async (searchQuery?: string) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      const url = params.toString()
        ? `/api/day-tours?${params}`
        : "/api/day-tours";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTours(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch day tours:", error);
      toast.error("Failed to load day tours");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchDayTours();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDayTours(search || undefined);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchDayTours]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this day tour?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/day-tours/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTours(tours.filter((t) => t.id !== id));
        toast.success("Day tour deleted");
      } else {
        toast.error("Failed to delete day tour");
      }
    } catch {
      toast.error("Failed to delete day tour");
    }
  };

  const togglePublish = async (tour: DayTour) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/day-tours/${tour.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !tour.published }),
      });

      if (res.ok) {
        setTours(
          tours.map((t) =>
            t.id === tour.id ? { ...t, published: !t.published } : t
          )
        );
        toast.success(tour.published ? "Day tour unpublished" : "Day tour published");
      }
    } catch {
      toast.error("Failed to update day tour");
    }
  };

  const filteredTours = tours;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Day Tours</h1>
          <p className="mt-1 text-sm text-gray-500">Manage single-day tour experiences</p>
        </div>
        <Link href="/dashboard/day-tours/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Day Tour
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search day tours..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 w-1/3 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Sun className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No day tours found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? "Try a different search term" : "Add your first day tour"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTours.map((tour) => (
            <div key={tour.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{tour.name}</h3>
                    {tour.published ? (
                      <span className="badge-success">Live</span>
                    ) : (
                      <span className="badge-neutral">Draft</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {tour.location} &middot; {tour.duration} &middot; {tour.tourType}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{tour.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tour.tags?.map((tag) => (
                      <span key={tag} className="badge-info">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => togglePublish(tour)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title={tour.published ? "Unpublish" : "Publish"}
                >
                  {tour.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Link
                  href={`/dashboard/day-tours/${tour.id}/edit`}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(tour.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
