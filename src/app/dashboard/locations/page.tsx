"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Pencil, Trash2, Search, MapPin, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRequirePermission } from "@/lib/useRequirePermission";
import type { Location } from "@/types";

const categoryColors: Record<string, string> = {
  cultural: "bg-purple-50 text-purple-700",
  natural: "bg-green-50 text-green-700",
  beach: "bg-blue-50 text-blue-700",
  wildlife: "bg-amber-50 text-amber-700",
  adventure: "bg-red-50 text-red-700",
  historical: "bg-stone-50 text-stone-700",
  religious: "bg-indigo-50 text-indigo-700",
};

export default function LocationsPage() {
  const { getToken } = useAuth();
  const { authorized, loading: permLoading } = useRequirePermission("locations");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const fetchLocations = useCallback(async (searchQuery?: string, category?: string) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (category) params.set("category", category);
      const res = await fetch(`/api/locations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLocations(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLocations(search || undefined, categoryFilter || undefined);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, categoryFilter, fetchLocations]);

  if (permLoading || !authorized) return null;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLocations((prev) => prev.filter((l) => l.id !== id));
        toast.success("Location deleted");
      }
    } catch {
      toast.error("Failed to delete location");
    }
  };

  const togglePublish = async (location: Location) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/locations/${location.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...location, published: !location.published }),
      });
      if (res.ok) {
        setLocations((prev) =>
          prev.map((l) =>
            l.id === location.id ? { ...l, published: !l.published } : l
          )
        );
        toast.success(location.published ? "Location unpublished" : "Location published");
      }
    } catch {
      toast.error("Failed to update location");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage destination details for the tour map
          </p>
        </div>
        <Link href="/dashboard/locations/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            className="input pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-full sm:w-48"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="cultural">Cultural</option>
          <option value="natural">Natural</option>
          <option value="beach">Beach</option>
          <option value="wildlife">Wildlife</option>
          <option value="adventure">Adventure</option>
          <option value="historical">Historical</option>
          <option value="religious">Religious</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No locations found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || categoryFilter ? "Try different filters" : "Get started by adding your first location"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div key={location.id} className="card overflow-hidden">
              {location.heroImage && (
                <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden">
                  <img
                    src={location.heroImage}
                    alt={location.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${categoryColors[location.category] || "bg-gray-50 text-gray-700"}`}>
                      {location.category}
                    </span>
                  </div>
                  <button
                    onClick={() => togglePublish(location)}
                    className={`absolute top-2 right-2 rounded-full p-1.5 ${
                      location.published
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                    title={location.published ? "Published" : "Draft"}
                  >
                    {location.published ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{location.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                    {location.briefDescription}
                  </p>
                  {location.attractions && location.attractions.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {location.attractions.length} nearby attraction{location.attractions.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                <Link
                  href={`/dashboard/locations/${location.id}/edit`}
                  className="flex-1 rounded-lg py-1.5 text-center text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600"
                >
                  <Pencil className="mr-1 inline h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="flex-1 rounded-lg py-1.5 text-center text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600"
                >
                  <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
